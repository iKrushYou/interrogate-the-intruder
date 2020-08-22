export default class Player {
  id: string;
  name: string;
  socketIds: Set<string>;

  constructor(id: string, name: string, socketId?: string) {
    this.id = id;
    this.name = name;
    this.socketIds = new Set();
    if (socketId) this.socketIds.add(socketId);
  }

}
