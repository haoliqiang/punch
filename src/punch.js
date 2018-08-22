let Vstate = {}
Vstate.install = function (Vue, options) {
  let vbstate = {}
  Vue.directive('vs', {
    bind(el, binding, vnode) {
      let vm = vnode.context // 当前的vue实例
      let allStatus = vm[binding.arg] // 当前的vue实例
      let ele = el
      let currentStatus
      if ((!ele.innerHTML || !ele.innerText) && allStatus[0].content) {
        currentStatus = 0
        ele.innerHTML = allStatus[currentStatus].content // 输入框的初始值
      } else {
        currentStatus = allStatus.some((status, index) => {
          if (status.content === ele.innerHTML) {
            return index
          }
        })
      }
      vbstate[binding.arg] = new VBstate({
        allStatus,
        currentStatus,
        vm,
        ele,
        symbol: binding.arg
      })

      ele.addEventListener('click', event => {
        vbstate[binding.arg].check(event)
      })
    },
    update(el, binding, vnode) {
      if (binding.oldValue !== binding.value && binding.value) {
        vbstate[binding.arg].setContent(vbstate[binding.arg].through(binding.value))
      }
    }
  })
}
class Punch {
  constructor(props = {}) {
    this.allStatus = props.allStatus
    this.vm = props.vm
    this.ele = props.ele
    this.currentIndex = props.currentIndex || 0
    this.currentStatus = this.allStatus[this.currentIndex]
  }

  check(e) {
    if (e) {
      e.preventDefault()
    }
    let fun = this.currentStatus.fun
    if (fun) {
      this.vm[fun] &&
        this.vm[fun]()
        .then(() => this.gostep('next'))
        .catch(() => this.gostep('previous'))
      this.currentStatus = this.allStatus[++this.currentIndex]
      return this.currentStatus
    }
  }

  gostep(step) {
    if (!this.currentStatus.fun) {
      if (step === 'next') {
        this.currentIndex = this.currentIndex === this.allStatus.length - 1 ? 0 : ++this.currentIndex
      } else if (step === 'previous') {
        this.currentIndex--
      }
      this.currentStatus = this.allStatus[this.currentIndex]
      return this.currentStatus
    }
  }

  through(status) {
    this.allStatus.filter((s, index) => {
      if (s.status === status) {
        this.currentIndex = index
        this.currentStatus = s
      }
    })
    return this.currentStatus
  }

  setContent(currentStatus) {
    if (currentStatus['content']) {
      this.ele.innerHTML = currentStatus['content']
    }
  }
}

export default Vstate
