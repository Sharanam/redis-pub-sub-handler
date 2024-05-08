import { bundledThemes } from "shiki";

export function Configurations({
  myTheme,
  setMyTheme,
  allowMultipleChannels,
  setAllowMultipleChannels,
  audio,
  setAudio,
  showBeatifiedOnly,
  setShowBeatifiedOnly,
}) {
  return (
    <div className="configurations">
      <label
        for="theme"
        className=""
      >
        <span>Theme</span>
        <select
          id="theme"
          onChange={(e) => {
            setMyTheme(e.target.value);
            window.localStorage.setItem("theme", e.target.value);
          }}
          disabled={!showBeatifiedOnly()}
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
      <label
        for="multipleChannels"
        title="This will display all channels at once, but it is currently buggy."
        className="background-indicator"
      >
        <input
          type="checkbox"
          id="multipleChannels"
          checked={allowMultipleChannels()}
          onChange={(e) => setAllowMultipleChannels(e.target.checked)}
        />{" "}
        Multiple channels
      </label>
      <label
        for="audio"
        className="background-indicator"
        title="Play a sound when a message is received."
      >
        <input
          type="checkbox"
          id="audio"
          checked={audio()}
          onChange={(e) => setAudio(e.target.checked)}
        />{" "}
        🔊
      </label>
      {/* showBeatifiedOnly */}
      <label
        for="showBeatifiedOnly"
        className="background-indicator"
        title="Show only the beatified messages."
      >
        <input
          type="checkbox"
          id="showBeatifiedOnly"
          checked={showBeatifiedOnly()}
          onChange={(e) => {
            setShowBeatifiedOnly(e.target.checked);
            localStorage.setItem("showBeatifiedOnly", e.target.checked);
          }}
        />{" "}
        Show beatified version
      </label>
    </div>
  );
}
