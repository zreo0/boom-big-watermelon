const Tools = require('Tools');

// 水果实例
const Fruit = cc.Class({
    name: 'FruitItem',
    properties: {
        id: 0,
        iconSF: cc.SpriteFrame,
    }
});
// 动画实例
const JuiceItem = cc.Class({
    name: 'JuiceItem',
    properties: {
        particle: cc.SpriteFrame,
        circle: cc.SpriteFrame,
        slash: cc.SpriteFrame,
    }
});

cc.Class({
    extends: cc.Component,

    properties: {
        fruits: {
            default: [],
            type: Fruit,
        },
        juices: {
            default: [],
            type: JuiceItem,
        },
        fruitPrefab: {
            default: null,
            type: cc.Prefab,
        },
        juicePrefab: {
            default: null,
            type: cc.Prefab,
        },
        // todo 可以实现一个audioManager
        boomAudio: {
            default: null,
            type: cc.AudioClip,
        },
        knockAudio: {
            default: null,
            type: cc.AudioClip,
        },
        waterAudio: {
            default: null,
            type: cc.AudioClip
        },
        scoreLabel: {
            default: null,
            type: cc.Label,
        },
        fingerBtn: {
            default: null,
            type: cc.Button,
        },
    },
    onLoad() {
        // 初始化物理引擎
        this.initPhysics();
        // 标识当前正在生成
        this.isCreating = false;
        // 当前水果的数量
        this.fruitCount = 0;
        // 积分
        this.score = 0;
        // 是否使用金手指
        this.useFinger = false;
        // 监听事件
        // this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // 保留点击结束事件使用 TODO 拖拽显示轨迹
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        // 开局初始化一个
        this.initOneFruit();
    },
    start() {
        this.fingerBtn.node.on(cc.Node.EventType.TOUCH_START, this.onFingerTouch, this);
    },
    /**
     * @description 点击屏幕事件开始，准备开始扔
     * @author ZW
     * @date 2021-58-08 04:02:35
     * @param {*} e 事件对象
     */
    onTouchStart(e) {
        console.log('####eee####', e);
        const { width, height } = this.node;
        let fruit = this.currentFruit;
        let { x, y } = e.getLocation();
        let fruitPos = fruit.getComponent(cc.RigidBody).getWorldPosition();
        // 通过刚体坐标和点击的位置计算角度
        console.log('##fruit pos##', fruitPos);

        

        x = x - width / 2;
        y = y - height / 2;
        
        // 开启物理效果
        this.startFruitPhysics(fruit);
        // 重力影响设置为0，在没有发生碰撞之前不产生重力作用
        fruit.getComponent(cc.RigidBody).gravityScale = 0;
        // 设置刚体类型
        // fruit.getComponent(cc.RigidBody).type = cc.RigidBodyType.Kinematic;
        // 设置相关属性 PhysicsCircleCollider
        let pcc = fruit.getComponent(cc.PhysicsCircleCollider);
        // 设置圆形半径
        pcc.radius = fruit.height / 2;
        pcc.apply();
        // 设置刚体运动速度
        fruit.getComponent(cc.RigidBody).linearVelocity = cc.v2(-2000, -2000);
        // 施加力
        let force = cc.v2(1, 1);
        fruit.getComponent(cc.RigidBody).applyForceToCenter(force);
    },
    /**
     * @description 移动中，坐标指示
     * @author ZW
     * @date 2021-57-08 04:02:56
     * @param {*} e 事件对象
     */
    onTouchMove(e) {

    },
    /**
     * @description 触摸结束事件，可以下落了
     * @author ZW
     * @date 2021-00-08 05:02:30
     * @param {*} e 事件对象
     */
    onTouchEnd(e) {
        if (this.isCreating) return;
        this.isCreating = true;
        const { width, height } = this.node;
        const fruit = this.currentFruit;
        let { x, y } = e.getLocation();
        let fruitPos = fruit.getComponent(cc.RigidBody).getWorldPosition();
        // 力度系数
        let forceFactor = 5;
        // 横向差异
        let diffX = x - fruitPos.x;
        // 纵向差异
        let diffY = y - fruitPos.y;
        // 开启物理效果
        this.startFruitPhysics(fruit);
        /* 原动画 */
        /*
        x = x - width / 2;
        y = y - height / 2;
        const action = cc.sequence(cc.moveBy(0.3, cc.v2(x, 0)).easing(cc.easeCubicActionIn()), cc.callFunc(() => {
            // 1s后重新生成一个
            this.scheduleOnce(() => {
                const nextId = this.getNextFruitId();
                this.initOneFruit(nextId);
                this.isCreating = false
            }, 1);
        }));
        fruit.runAction(action); */
        // 重力影响设置为0，在没有发生碰撞之前不产生重力作用
        fruit.getComponent(cc.RigidBody).gravityScale = 0;
        // 设置刚体类型 TODO 这里设置为Kinematic类型之后丢失了碰撞，具体不知道啥原因
        // fruit.getComponent(cc.RigidBody).type = cc.RigidBodyType.Kinematic;
        // 设置相关属性 PhysicsCircleCollider
        let pcc = fruit.getComponent(cc.PhysicsCircleCollider);
        // 设置圆形半径
        pcc.radius = fruit.height / 2;
        pcc.apply();
        // 设置刚体运动速度
        fruit.getComponent(cc.RigidBody).linearVelocity = cc.v2(diffX * forceFactor, diffY * forceFactor);
        // 施加力
        let force = cc.v2(1, 1);
        fruit.getComponent(cc.RigidBody).applyForceToCenter(force);
        // 生成新的水果
        this.scheduleOnce(() => {
            this.initOneFruit(this.getNextFruitId());
            this.isCreating = false;
        }, 1);
    },
    // 开启物理引擎和碰撞检测
    initPhysics() {
        // 物理引擎
        const instance = cc.director.getPhysicsManager();
        instance.enabled = true;
        // instance.debugDrawFlags = 4
        // 设置重力
        instance.gravity = cc.v2(0, -960);
        // 碰撞检测
        const collisionManager = cc.director.getCollisionManager();
        collisionManager.enabled = true;
        // 设置四周的碰撞区域
        let width = this.node.width;
        let height = this.node.height;
        let node = new cc.Node();
        let body = node.addComponent(cc.RigidBody);
        // 设置类型
        body.type = cc.RigidBodyType.Static;

        const _addBound = (node, x, y, width, height) => {
            let collider = node.addComponent(cc.PhysicsBoxCollider);
            collider.offset.x = x;
            collider.offset.y = y;
            collider.size.width = width;
            collider.size.height = height;
        }
        _addBound(node, 0, -height / 2, width, 1);
        _addBound(node, 0, height / 2, width, 1);
        _addBound(node, -width / 2, 0, 1, height);
        _addBound(node, width / 2, 0, 1, height);

        node.parent = this.node;
    },

    initOneFruit(id = 1) {
        this.fruitCount ++;
        this.currentFruit = this.createFruitOnPos(0, 400, id);
    },
    onFingerTouch() {
        console.log('onFingerTouch')
        this.useFinger = true
    },
    // 获取下一个水果的id
    getNextFruitId() {
        if (this.fruitCount < 3) {
            return 1
        } else if (this.fruitCount === 3) {
            return 2
        } else {
            // 随机返回前5个
            return Math.floor(Math.random() * 5) + 1
        }
    },
    // 创建一个水果
    createOneFruit(num) {
        let fruit = cc.instantiate(this.fruitPrefab);
        const config = this.fruits[num - 1]

        fruit.getComponent('Fruit').init({
            id: config.id,
            iconSF: config.iconSF
        });

        fruit.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static
        fruit.getComponent(cc.PhysicsCircleCollider).radius = 0

        this.node.addChild(fruit);
        fruit.scale = 0.6

        // 有Fruit组件传入
        fruit.on('sameContact', this.onSameFruitContact.bind(this))
        fruit.on(cc.Node.EventType.TOUCH_START, (e) => {
            // 选择道具时直接消除对应水果
            if (this.useFinger && fruit !== this.currentFruit) {
                const {x, y, width} = fruit
                this.createFruitJuice(config.id, cc.v2({x, y}), width)
                e.stopPropagation()
                this.useFinger = false
                fruit.removeFromParent(true)

            }
        })

        return fruit;
    },
    /**
     * @description 设置物理属性
     * @author ZW
     * @date 2021-21-08 11:02:42
     * @param {*} fruit 水果实例
     */
    startFruitPhysics(fruit) {
        // 设置刚体类型
        fruit.getComponent(cc.RigidBody).type = cc.RigidBodyType.Dynamic;
        // 设置相关属性 PhysicsCircleCollider
        const pcc = fruit.getComponent(cc.PhysicsCircleCollider);
        // 设置圆形半径
        pcc.radius = fruit.height / 2;
        pcc.apply();
    },

    /**
     * @description 在指定位置生成水果
     * @author ZW
     * @date 2021-28-08 11:02:21
     * @param {number} x 坐标x
     * @param {number} y 坐标y
     * @param {number} [type=1] 类型
     * @returns {*} 水果实例
     */
    createFruitOnPos(x, y, type = 1) {
        const fruit = this.createOneFruit(type);
        fruit.setPosition(cc.v2(x, y));
        return fruit;
    },
    // 两个水果碰撞
    onSameFruitContact({ self, other }) {
        other.node.off('sameContact');

        const id = other.getComponent('Fruit').id
        // todo 可以使用对象池回收
        self.node.removeFromParent(true)
        other.node.removeFromParent(true)

        const { x, y } = other.node;

        this.createFruitJuice(id, cc.v2({ x, y }), other.node.width);

        this.addScore(id);

        const nextId = id + 1;
        if (nextId <= 11) {
            const newFruit = this.createFruitOnPos(x, y, nextId);

            this.startFruitPhysics(newFruit);

            // 展示动画 todo 动画效果需要调整
            newFruit.scale = 0;
            cc.tween(newFruit).to(.5, {
                scale: 0.6
            }, {
                easing: 'backOut'
            }).start()
        } else {
            // todo 合成两个西瓜
            console.log(' todo 合成两个西瓜 还没有实现哦~ ')
        }
    },

    // 合并时的动画效果
    createFruitJuice(id, pos, n) {
        // 播放合并的声音
        cc.audioEngine.play(this.boomAudio, false, 1);
        cc.audioEngine.play(this.waterAudio, false, 1);
        // 展示动画
        let juice = cc.instantiate(this.juicePrefab);
        this.node.addChild(juice);
        // 获取果汁动画配置
        const config = this.juices[id - 1];
        const instance = juice.getComponent('Juice');
        instance.init(config);
        instance.showJuice(pos, n);
    },
    // 添加得分分数
    addScore(fruitId) {
        this.score += fruitId * 2;
        // todo 处理分数tween动画
        this.scoreLabel.string = this.score;
    },
    
});
