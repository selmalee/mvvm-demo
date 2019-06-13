// 订阅者(ViewModel)
function Watcher(el, attr, vm, exp) {
  this.el = el 　// 指令对应的DOM元素
  this.attr = attr // DOM元素绑定的属性值
  this.vm = vm // 指令所属的myVue实例
  this.exp = exp // myVue实例更新的属性

  this.update()
}
// 更新视图
Watcher.prototype.update = function() {
  this.el[this.attr] = this.vm.$data[this.exp]
}
