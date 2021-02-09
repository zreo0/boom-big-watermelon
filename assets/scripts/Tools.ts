module.exports = {
    /**
     * 获取两点之间的距离
     * @author ZW
     * @date 2021-31-09 21:02:47
     * @param {cc.Vec2} start 开始点
     * @param {cc.Vec2} end 结束点
     * @returns {*} 距离
     */
    getDistance(start: cc.Vec2, end: cc.Vec2): number {
        let pos = cc.v2(start.x - end.x, start.y - end.y);
        let dis = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
        return dis;
    },
    /**
     * 获得两点之间夹角角度
     * @author ZW
     * @date 2021-44-09 21:02:18
     * @param {cc.Vec2} start 开始点
     * @param {cc.Vec2} end 结束点
     * @returns {*}  {*} 角度值
     */
    getAngle(start: cc.Vec2, end: cc.Vec2): any{
        // 计算朝向
        let dx = end.x - start.x;
        let dy = end.y - start.y;
        let dir = cc.v2(dx, dy);
        // 根据朝向计算出夹角弧度
        let angle = dir.signAngle(cc.v2(1, 0));
        // 将弧度转换为欧拉角
        let degree = angle / Math.PI * 180;

        return -degree
        // return angle;
    },

}
