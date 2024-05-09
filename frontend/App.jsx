import { For } from "solid-js/web";
import Diff from "text-diff";
import { codeToHtml } from "shiki";
import { Show, createSignal, onMount } from "solid-js";
import { Configurations, Publisher } from "./components";

const diff = new Diff({});

export default function App() {
  const ws = new WebSocket(`ws://localhost:${import.meta.env.WS_PORT || 8081}`);
  onMount(() => {
    document.addEventListener("keydown", (e) => {
      // left arrow key
      if (e.keyCode === 37) {
        document.querySelector(".selected")?.previousElementSibling?.click();
      }
      // right arrow key
      if (e.keyCode === 39) {
        document.querySelector(".selected")?.nextElementSibling?.click();
      }
      // copy button click on c key
      if (e.keyCode === 67) {
        document.querySelector("button[data-name='copy button']")?.click();
      }
    });
  });

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
  const [isCopied, setIsCopied] = createSignal(false);

  const [diffMessage, setDiffMessage] = createSignal("");

  const [showBeatifiedOnly, setShowBeatifiedOnly] = createSignal(
    window.localStorage.getItem("showBeatifiedOnly") === "true" || false
  );

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
          showBeatifiedOnly={showBeatifiedOnly}
          setShowBeatifiedOnly={setShowBeatifiedOnly}
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
                    setIsCopied(false);
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
              <For each={incomingMessages()[currentChannel()]}>
                {(message, index) => (
                  <button
                    className="unit"
                    onClick={async (e) => {
                      document
                        .querySelectorAll(".unit")
                        .forEach((el) => el.classList.remove("selected"));
                      e.target.classList.add("selected");
                      setCurrentMessage(await beautify(message[0]));

                      // set diff message
                      if (index() > 0) {
                        const d = diff.main(
                          ...[
                            incomingMessages()[currentChannel()][
                              index() - 1
                            ][0],
                            message[0],
                          ].map((x) => {
                            let parsed;
                            try {
                              parsed = JSON.stringify(JSON.parse(x), null, 2);
                              parsed = parsed
                                .replace(/\\n/g, "<br />")
                                .replace(/\\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
                            } catch (e) {
                              parsed = x;
                            }
                            return parsed;
                          })
                        );
                        setDiffMessage(diff.prettyHtml(d));
                      } else {
                        setDiffMessage(await beautify(message[0]));
                      }
                      setIsCopied(false);
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
        <Show
          when={showBeatifiedOnly()}
          fallback={
            <div className="diff-message-viewer">
              <div innerHTML={diffMessage()}></div>
            </div>
          }
        >
          <div className="current-message-viewer">
            <button
              onClick={() => {
                document
                  .querySelector(".selected")
                  ?.classList.remove("selected");
                setCurrentMessage("");
                setIsCopied(false);
              }}
            >
              Hide
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  document.querySelector("[data-name='current-message']")
                    .innerText
                );
                setIsCopied(true);
              }}
              data-name="copy button"
              title="press c to copy"
              disabled={!currentMessage()}
              className={isCopied() ? "copied" : ""}
            >
              {isCopied() ? "Copied" : "Copy"}
            </button>
            <div
              data-name="current-message"
              innerHTML={currentMessage()}
            ></div>
          </div>
        </Show>
      </div>
    </>
  );
}
