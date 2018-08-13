// myVue构造函数
function myVue(options) {
  this._init(options)
}
myVue.prototype._init = function (options) {
  this.$options = options
  this.$el = document.querySelector(options.el) // 根节点dom
  this.$data = options.data
  this.$methods = options.methods

  this._binding = {} // 绑定的订阅者
  this._observe(this.$data) // 监听属性
  this._compile(this.$el)
}

// 监听者
myVue.prototype._observe = function(obj) {
  var value
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      value = obj[key]
      if (typeof value === 'object') {
        this._observe(value)
      }
      this._binding[key] = {
        _watchers: []
      }
      var binding = this._binding[key]
      Object.defineProperty(this.$data, key, {
        enumerable: true,
        configurable: true,
        get: function() {
          console.log('获取属性' + key + ': ' + value)
          return value
        },
        set: function(newVal) {
          console.log('设置属性' + key + ': ' + newVal)
          value = newVal
          // 通知该属性的所有订阅者更新数据
          binding._watchers.forEach(function(item) {
            item.update()
          })
        }
      })
    }
  }
}

// 订阅者
function Watcher(el, vm, exp, attr) {
  this.el = el 　// 指令对应的DOM元素
  this.vm = vm // 指令所属的myVue实例
  this.exp = exp // myVue实例更新的属性
  this.attr = attr // DOM元素绑定的属性值

  this.update()
}
// 更新视图
Watcher.prototype.update = function() {
  this.el[this.attr] = this.vm.$data[this.exp]
}

// 解析并绑定view和model
myVue.prototype._compile = function(app) {
  var nodes = app.children
  var _this = this
  for (let i = 0, len = nodes.length; i < len; i++) {
    var node = nodes[i]
    if (node.children.length) {
      this._compile(node)
    }
    // v-click
    if (node.hasAttribute('v-click')) {
      var methodName = node.getAttribute('v-click')
      node.onclick = _this.$methods[methodName].bind(_this.$data)
    }
    // v-model
    if (node.hasAttribute('v-model') && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA')) {
      var dataName = node.getAttribute('v-model')
      // 添加订阅者
      _this._binding[dataName]._watchers.push(new Watcher(node, _this, dataName, 'value'))
      node.addEventListener('input', function() {
        _this.$data[dataName] = this.value // 使data与dom的值保持一致
      })
    }
    // v-bind
    if (node.hasAttribute('v-bind')) {
      var dataName = node.getAttribute('v-bind')
      // 添加订阅者
      _this._binding[dataName]._watchers.push(new Watcher(node, _this, dataName, 'innerHTML'))
    }
  }
}
