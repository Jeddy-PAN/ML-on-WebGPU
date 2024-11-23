import { defineStore } from "pinia";

export const useWebSocketStore = defineStore('webSocket', {
  state: () => ({
    clients: new Map(),
  }),

  actions: {
    setClients(clientID, client){
      this.clients.set(clientID, client);
    },
    getWebSocket(clientID){
      if(!this.clients.has(clientID)){
        return null;
      }
      return this.clients.get(clientID);
    }
  }

})