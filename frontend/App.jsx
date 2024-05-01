import { For } from "solid-js/web";
import { codeToHtml } from "shiki";
import { Show, createSignal } from "solid-js";
import { Configurations, Publisher } from "./components";

export default function App() {
  const ws = new WebSocket(`ws://localhost:${import.meta.env.WS_PORT || 8081}`);

  ws.onopen = () => {
    console.log("Connected to the WebSocket server");
  };

  const [publisherChannel, setPublisherChannel] = createSignal("test-channel");
  const [message, setMessage] = createSignal("");

  const [incomingMessages, setIncomingMessages] = createSignal({});
  const [hiddenChannels, setHiddenChannels] = createSignal([]);

  const [allowMultipleChannels, setAllowMultipleChannels] = createSignal(false);
  const [currentChannel, setCurrentChannel] = createSignal("Welcome");

  const [currentMessage, setCurrentMessage] = createSignal("");

  const [myTheme, setMyTheme] = createSignal(
    window.localStorage.getItem("theme") || "houston"
  );

  const [isAudio, setIsAudio] = createSignal(false);

  ws.onmessage = async (event) => {
    let [channel, message] = event.data.split(/:(.+)/).map((x) => x.trim());

    setIncomingMessages((prev) => {
      return {
        ...prev,
        [channel]: message
          ? [
              ...(prev[channel] || []),
              [message, new Date().toLocaleTimeString()],
            ]
          : prev[channel],
      };
    });

    playSoundForChannel(channel);
  };
  function playSoundForChannel(channel) {
    if (!isAudio()) return;
    if (!allowMultipleChannels() && currentChannel() === channel) {
      new Audio("sms.mp3").play();
    } else {
      new Audio("beep_beep.mp3").play();
    }
  }

  function handleSubmit(e) {
    if (e.key === "Enter") {
      if (!publisherChannel() || !message()) return;
      ws.send(
        JSON.stringify({ channel: publisherChannel(), message: message() })
      );
      setMessage("");
    }
  }

  async function beautify(message) {
    let res;
    try {
      message = JSON.parse(message);
      res = JSON.stringify(message, null, 2);

      res = await codeToHtml(res, {
        lang: "json",
        theme: myTheme(),
      });
    } catch (_) {
      res = message;
    }
    return res;
  }

  return (
    <>
      <h1>Redis Pub/Sub</h1>
      <Publisher
        channel={publisherChannel}
        message={message}
        setChannel={setPublisherChannel}
        setMessage={setMessage}
        handleSubmit={handleSubmit}
      />
      <div className="heading">
        <h2>Messages</h2>
        <Configurations
          myTheme={myTheme}
          setMyTheme={(val) => {
            setMyTheme(val);
            document.querySelector("button.unit.selected")?.click(); // re-render the selected message (if any)
          }}
          allowMultipleChannels={allowMultipleChannels}
          setAllowMultipleChannels={setAllowMultipleChannels}
          audio={isAudio}
          setAudio={(val) => {
            if (val) {
              new Audio("sms.mp3").play();
            }
            setIsAudio(val);
          }}
        />
      </div>
      <div className="window">
        <div className="channels">
          <For each={Object.keys(incomingMessages())}>
            {(channel) => (
              <button
                className={`channel-btn ${
                  !allowMultipleChannels() && currentChannel() === channel
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  if (currentChannel() !== channel) {
                    setCurrentChannel(channel);
                    setCurrentMessage("Channel has been changed.");
                  }
                  setPublisherChannel(channel);
                  if (!allowMultipleChannels()) {
                    return;
                  }
                  if (hiddenChannels().includes(channel)) {
                    setHiddenChannels((prev) =>
                      prev.filter((ch) => ch !== channel)
                    );
                  } else {
                    setHiddenChannels((prev) => [...prev, channel]);
                  }
                }}
              >
                {allowMultipleChannels()
                  ? hiddenChannels().includes(channel)
                    ? "🟪 "
                    : "☑️ "
                  : ""}{" "}
                {channel}
              </button>
            )}
          </For>
        </div>
        <div id="messages">
          <Show
            when={!allowMultipleChannels() && currentChannel()}
            fallback={
              <For
                each={Object.keys(incomingMessages()).filter(
                  (channel) => !hiddenChannels().includes(channel)
                )}
                fallback={<p>No messages</p>}
              >
                {(channel) => (
                  <Show when={!hiddenChannels().includes(channel)}>
                    <p>
                      <strong>{channel}</strong>
                      <Show when={incomingMessages()[channel]?.length}>
                        <For each={incomingMessages()[channel]}>
                          {(message) => (
                            <span
                              className="unit"
                              innerHTML={message[0]}
                            ></span>
                          )}
                        </For>
                      </Show>
                    </p>
                  </Show>
                )}
              </For>
            }
          >
            <Show when={incomingMessages()[currentChannel()]?.length}>
              {/* <strong className="sticky-channel-name">
                {currentChannel()}
              </strong> */}
              <For each={incomingMessages()[currentChannel()]}>
                {(message) => (
                  <button
                    className="unit"
                    onClick={async (e) => {
                      document
                        .querySelectorAll(".unit")
                        .forEach((el) => el.classList.remove("selected"));
                      e.target.classList.add("selected");
                      setCurrentMessage(await beautify(message[0]));
                    }}
                  >
                    {message[1]} <br />
                    {message[0]}
                  </button>
                )}
              </For>
            </Show>
          </Show>
        </div>
        <div className="current-message-viewer">
          <button
            onClick={() => {
              document.querySelector(".selected")?.classList.remove("selected");
              setCurrentMessage("");
            }}
          >
            Hide
          </button>
          <div innerHTML={currentMessage()}></div>
        </div>
      </div>
    </>
  );
}
