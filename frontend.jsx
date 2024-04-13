import { codeToHtml, bundledThemes } from "shiki";
import { For, render } from "solid-js/web";
import { Show, createSignal } from "solid-js";
import "./app.css";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

render(() => <App key={0} />, root);

function App() {
  const ws = new WebSocket(`ws://localhost:${import.meta.env.WS_PORT || 8081}`);

  ws.onopen = () => {
    console.log("Connected to the WebSocket server");
  };

  const [channel, setChannel] = createSignal("test-channel");
  const [message, setMessage] = createSignal("");

  const [incomingMessages, setIncomingMessages] = createSignal({});
  const [hiddenChannels, setHiddenChannels] = createSignal([]);

  const [allowMultipleChannels, setAllowMultipleChannels] = createSignal(false);
  const [currentChannel, setCurrentChannel] = createSignal("Welcome");

  const [myTheme, setMyTheme] = createSignal(
    window.localStorage.getItem("theme") || "houston"
  );

  ws.onmessage = async (event) => {
    let [channel, message] = event.data.split(/:(.+)/).map((x) => x.trim());
    message = await beautify(message);
    setIncomingMessages((prev) => {
      return {
        ...prev,
        [channel]: message
          ? [...(prev[channel] || []), message]
          : prev[channel],
      };
    });

    playSoundForChannel(channel);
  };
  function playSoundForChannel(channel) {
    if (!allowMultipleChannels() && currentChannel() === channel) {
      new Audio("sms.mp3").play();
    } else {
      new Audio("beep_beep.mp3").play();
    }
  }

  function handleSubmit(e) {
    if (e.key === "Enter") {
      if (!channel() || !message()) return;
      ws.send(JSON.stringify({ channel: channel(), message: message() }));
      setMessage("");
    }
  }

  async function beautify(message) {
    let res;
    try {
      message = JSON.parse(message);
      res = JSON.stringify(message, null, 2);

      // res = res
      //   .replace(/\\n/g, "<br>")
      //   .replace(/"(.*?)":/g, "<b>$1</b>:")
      //   .replace(/ /g, "&nbsp;")
      //   .replace(/\n/g, "<br />");

      // // sanitize html
      // res = res.replace(/</g, "&lt;").replace(/>/g, "&gt;");

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
      <div className="row-1">
        <div className="publisher">
          <h2>Publisher</h2>
          <input
            id="message"
            type="text"
            autofocus
            placeholder="Send to Redis Pub/Sub"
            value={message()}
            onInput={(e) => setMessage(e.target.value)}
            onKeyUp={handleSubmit}
          />
          <input
            type="text"
            id="channel"
            placeholder="Channel name"
            value={channel()}
            onInput={(e) => setChannel(e.target.value)}
            onKeyUp={handleSubmit}
          />
        </div>
      </div>
      {/* <div className="filter-container">
        <textarea
          id="filter"
          placeholder="Filter messages"
          aria-label="Filter messages"
          onInput={(e) => {
            setHiddenChannels(
              Object.keys(incomingMessages()).filter(
                (channel) =>
                  !incomingMessages()[channel].some((message) =>
                    message.includes(e.target.value)
                  )
              )
            );
          }}
        ></textarea>
        <button onClick={() => setHiddenChannels([])}>Show all</button>
        <button
          onClick={() => setHiddenChannels(Object.keys(incomingMessages()))}
        >
          Hide all
        </button>
      </div> */}
      <div className="heading">
        <h2>Subscribers</h2>
        <label for="theme">
          Theme:{" "}
          <select
            id="theme"
            onChange={(e) => {
              setMyTheme(e.target.value);
              window.localStorage.setItem("theme", e.target.value);
            }}
          >
            <For each={Object.keys(bundledThemes)}>
              {(theme) => (
                <option
                  value={theme}
                  selected={theme === myTheme()}
                >
                  {theme}
                </option>
              )}
            </For>
          </select>
        </label>
        <label for="multipleChannels">
          <input
            type="checkbox"
            id="multipleChannels"
            checked={allowMultipleChannels()}
            onChange={(e) => setAllowMultipleChannels(e.target.checked)}
          />{" "}
          Allow multiple channels
        </label>
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
                  if (!allowMultipleChannels()) {
                    setCurrentChannel(channel);
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
                              innerHTML={message}
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
              <strong className="sticky-channel-name">
                {currentChannel()}
              </strong>
              <For each={incomingMessages()[currentChannel()]}>
                {(message) => (
                  <div className="unit">
                    <label>
                      <input type="checkbox">Read more</input>
                    </label>
                    <span innerHTML={message}></span>
                  </div>
                )}
              </For>
            </Show>
          </Show>
        </div>
      </div>
    </>
  );
}
