import { defineStore } from "pinia";

export const useWebSocketStore = defineStore('webSocket', {
  state: () => ({
    clientID: null,       // clientID of this client    
    ws: null,             // instance of this client (clientFactory.js)
    clientList: new Map() // get worker clientList (from server)
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