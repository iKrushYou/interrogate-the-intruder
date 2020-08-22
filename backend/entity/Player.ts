export default class Player {
    name: String;
    socketIds: Set<String>;

    constructor(name: String) {
        this.name = name;
        this.socketIds = new Set();
    }

}
