// myVue构造函数
function myVue(options) {
  this.$el = document.querySelector(options.el) // 根节点dom
  this.$data = options.data
  this.$methods = options.methods

  this._binding = {} // 绑定的订阅者
  this._observe(this.$data) // 挟持并监听所有属性
  this._compile(this.$el)
}

// 解析并绑定view和viewmodel
myVue.prototype._compile = function(root) {
  var nodes = root.children
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
      _this._binding[dataName]._watchers.push(new Watcher(node, 'value', _this, dataName))
      node.addEventListener('input', function() {
        _this.$data[dataName] = this.value // 使data与dom的值保持一致
      })
    }
    // v-bind
    if (node.hasAttribute('v-bind')) {
      var dataName = node.getAttribute('v-bind')
      // 添加订阅者
      _this._binding[dataName]._watchers.push(new Watcher(node, 'innerHTML', _this, dataName))
    }
  }
}

// 监听者(Model)
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
        enumerable: true, // 出现在对象的枚举属性中
        configurable: true, // 该属性描述符能否被改变/删除
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
