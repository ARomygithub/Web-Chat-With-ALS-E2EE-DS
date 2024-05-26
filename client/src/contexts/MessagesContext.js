import { createContext, useContext, useReducer } from 'react';

const MessageContext = createContext(null);
const MessageDispatchContext = createContext(null);

export function MessagesProvider({ children }) {
  const [messages, dispatch] = useReducer(messagesReducer, initialMessages);

  return (
    <MessageContext.Provider value={messages}>
      <MessageDispatchContext.Provider value={dispatch}>
        {children}
      </MessageDispatchContext.Provider>
    </MessageContext.Provider>
  );
}

export function useMessages() {
  return useContext(MessageContext)
}

export function useMessagesDispatch() {
  return useContext(MessageDispatchContext);
}

function messagesReducer(messages, action) {
  switch (action.type) {
    case 'newmessage':
      return [...messages, {
        ...action.message,
        time: `${new Date().getHours()}:${new Date().getMinutes()}`
      }]
    case 'fetch':
      return action.messages;
    default:
      throw Error('Unknown action: ' + action.type);
  }
}

const initialMessages = [];
const initialPartner = '';

const PartnerContext = createContext(null);
const PartnerDispatchContext = createContext(null);

function partnerReducer(partner, action) {
  switch (action.type) {
    case 'set':
      return action.partner;
    default:
      throw Error('Unknown action: ' + action.type);
  }
}
export function usePartner() {
  return useContext(PartnerContext);
}
export function usePartnerDispatch() {
  return useContext(PartnerDispatchContext);
}

export function PartnerProvider({ children }) {
  const [partner, dispatch] = useReducer(partnerReducer, initialPartner);

  return (
    <PartnerContext.Provider value={partner}>
      <PartnerDispatchContext.Provider value={dispatch}>
        {children}
      </PartnerDispatchContext.Provider>
    </PartnerContext.Provider>
  );
}