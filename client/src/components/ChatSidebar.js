import ChatPartner from './ChatPartner';

function ChatSidebar() {
  return (
    <aside className="column is-2 is-hidden-mobile has-background-light has-text-black">
      <ChatPartner />
    </aside>
  );
}

export default ChatSidebar;
