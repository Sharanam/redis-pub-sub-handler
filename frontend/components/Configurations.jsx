import { bundledThemes } from "shiki";

export function Configurations({
  myTheme,
  setMyTheme,
  allowMultipleChannels,
  setAllowMultipleChannels,
  audio,
  setAudio,
  showBeautifiedOnly,
  setShowBeautifiedOnly,
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
          disabled={!showBeautifiedOnly()}
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
      {/* showBeautifiedOnly */}
      <label
        for="showBeautifiedOnly"
        className="background-indicator"
        title="Show only the beautified messages."
      >
        <input
          type="checkbox"
          id="showBeautifiedOnly"
          checked={showBeautifiedOnly()}
          onChange={(e) => {
            setShowBeautifiedOnly(e.target.checked);
            localStorage.setItem("showBeautifiedOnly", e.target.checked);
          }}
        />{" "}
        Show beautified version
      </label>
    </div>
  );
}
