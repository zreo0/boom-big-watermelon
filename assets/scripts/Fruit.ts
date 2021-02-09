const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property
    id: number = 0;
    
    init(data) {
        this.id = data.id;
        const sp = this.node.getComponent(cc.Sprite);
        sp.spriteFrame = data.iconSF;
    }
    start() {
    }
    onBeginContact(contact, self, other) {
        // 产生碰撞的时候设置刚体重力
        self.node.getComponent(cc.RigidBody).gravityScale = 1;
        // 貌似检测有点消耗性能
        if (self.node && other.node) {
            const s = self.node.getComponent('Fruit')
            const o = other.node.getComponent('Fruit')
            if (s && o && s.id === o.id) {
                self.node.emit('sameContact', { self, other });
            }
        }
    }
}
