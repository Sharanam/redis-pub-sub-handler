export function Publisher({
  channel,
  message,
  setChannel,
  setMessage,
  handleSubmit,
}) {
  return (
    <div className="publisher">
      <h2>Publish a message</h2>
      <input
        type="text"
        id="channel"
        placeholder="Channel name"
        value={channel()}
        onInput={(e) => setChannel(e.target.value)}
        onKeyUp={handleSubmit}
      />
      <input
        id="message"
        type="text"
        autofocus
        placeholder="Send message to Redis Pub/Sub"
        value={message()}
        onInput={(e) => setMessage(e.target.value)}
        onKeyUp={handleSubmit}
      />
    </div>
  );
}
