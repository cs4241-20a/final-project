      var drag = document.getElementById('fp0')

      drag.onmousedown = function (e) {
        var e = e || window.event // 兼容ie浏览器
        var diffX = e.clientX - drag.offsetLeft // 鼠标点击物体那一刻相对于物体左侧边框的距离=点击时的位置相对于浏览器最左边的距离-物体左边框相对于浏览器最左边的距离
        var diffY = e.clientY - drag.offsetTop
        
        if (typeof drag.setCapture !== 'undefined') {
          drag.setCapture()
        }

        document.onmousemove = function (e) {
          var e = e || window.event // 兼容ie浏览器
          var left = e.clientX - diffX
          var top = e.clientY - diffY

          if (left < 0) {
            left = 0
          } else if (left > window.innerWidth - drag.offsetWidth) {
            left = window.innerWidth - drag.offsetWidth
          }
          if (top < 0) {
            top = 0
          } else if (top > window.innerHeight - drag.offsetHeight) {
            top = window.innerHeight - drag.offsetHeight
          }

          drag.style.left = left + 'px'
          drag.style.top = top + 'px'
        }
        document.onmouseup = function (e) { // 当鼠标弹起来的时候不再移动
          console.log('this', this)
          this.onmousemove = null
          this.onmouseup = null // 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）

          // 修复低版本ie bug
          if (typeof drag.releaseCapture !== 'undefined') {
            drag.releaseCapture()
          }
        }
      }