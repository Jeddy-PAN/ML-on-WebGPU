import { defineStore } from "pinia";

export const useWebSocketStore = defineStore('webSocket', {
  state: () => ({
    clientID: null,
    ws: null,
    clientList: new Map()
  }),

  actions: {
    setClientID(clientID){
      this.clientID = clientID;
    },
    getClientID(){
      return this.clientID;
    },
    setClients(clientID, client){
      this.clientList.set(clientID, client);
    },
    getClients(){
      return this.clientList;
    },
    setWS(ws){
      this.ws = ws;
    },
    getWS(){
      return this.ws;
    }
  }

})