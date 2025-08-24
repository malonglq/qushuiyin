// pages/index/index.js
const app = getApp()

Page({
  data: {
    currentMode: 'traditional', // 'traditional' 或 'link'
    linkInput: '',
    processing: false,
    recentImages: [],
    clipboardImage: ''
  },

  onLoad() {
    // 页面加载时的初始化
    this.loadRecentImages()
    this.checkClipboard()
  },

  onShow() {
    // 页面显示时的处理
    this.loadRecentImages()
    this.checkClipboard()
  },

  // 加载最近处理记录
  loadRecentImages() {
    try {
      const history = wx.getStorageSync('processHistory') || []
      const recent = history.slice(0, 4).map(item => ({
        ...item,
        time: this.formatTime(item.timestamp)
      }))
      this.setData({
        recentImages: recent
      })
    } catch (error) {
      console.error('加载最近记录失败:', error)
    }
  },

  // 检查剪贴板
  checkClipboard() {
    wx.getClipboardData({
      success: (res) => {
        const data = res.data
        if (this.isImageUrl(data)) {
          this.setData({
            clipboardImage: data
          })
          // 询问用户是否要使用剪贴板链接
          this.showClipboardDialog(data)
        }
      },
      fail: (error) => {
        console.log('剪贴板检查失败:', error)
      }
    })
  },

  // 显示剪贴板链接对话框
  showClipboardDialog(link) {
    wx.showModal({
      title: '检测到图片链接',
      content: `是否要使用剪贴板中的链接？\n${link.substring(0, 50)}...`,
      confirmText: '使用',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            currentMode: 'link',
            linkInput: link
          })
        }
      }
    })
  },

  // 判断是否为图片链接
  isImageUrl(url) {
    if (!url || typeof url !== 'string') return false
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    const imageUrlPatterns = [
      /\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)?$/i,
      /^https?:\/\/.*\.(jpg|jpeg|png|gif|bmp|webp)/i,
      /^https?:\/\/(i\.pximg\.net|pbs\.twimg\.com|.*\.xiaohongshu\.com|.*\.douyin\.com)/i
    ]
    
    return imageUrlPatterns.some(pattern => pattern.test(url))
  },

  // 切换输入方式
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      currentMode: mode
    })
  },

  // 选择图片
  chooseImage(e) {
    const type = e.currentTarget?.dataset.type || 'album'
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: type === 'camera' ? ['camera'] : ['album'],
      maxDuration: 30,
      camera: 'back',
      success: (res) => {
        const file = res.tempFiles[0]
        
        // 检查文件大小
        if (file.size > 10 * 1024 * 1024) {
          app.showError('图片大小不能超过10MB')
          return
        }
        
        // 检查文件类型
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
        if (!validTypes.includes(file.fileType)) {
          app.showError('只支持JPG、PNG格式')
          return
        }
        
        // 跳转到处理页面
        this.goToProcess(file)
      },
      fail: (error) => {
        console.error('选择图片失败:', error)
        if (error.errMsg !== 'chooseMedia:fail cancel') {
          app.showError('选择图片失败')
        }
      }
    })
  },

  // 处理链接输入
  onLinkInput(e) {
    this.setData({
      linkInput: e.detail.value
    })
  },

  // 链接输入框聚焦
  onLinkFocus() {
    // 可以添加聚焦时的效果
  },

  // 链接输入框失焦
  onLinkBlur() {
    // 可以添加失焦时的效果
  },

  // 粘贴链接
  pasteLink() {
    wx.getClipboardData({
      success: (res) => {
        const data = res.data
        if (this.isImageUrl(data)) {
          this.setData({
            linkInput: data
          })
          app.showSuccess('链接已粘贴')
        } else {
          app.showError('剪贴板中没有有效的图片链接')
        }
      },
      fail: (error) => {
        console.error('粘贴失败:', error)
        app.showError('粘贴失败')
      }
    })
  },

  // 清空链接
  clearLink() {
    this.setData({
      linkInput: ''
    })
  },

  // 处理链接
  processLink() {
    const link = this.data.linkInput.trim()
    if (!link) {
      app.showError('请输入图片链接')
      return
    }
    
    if (!this.isImageUrl(link)) {
      app.showError('请输入有效的图片链接')
      return
    }
    
    this.setData({
      processing: true
    })
    
    // 显示加载提示
    app.showLoading('正在下载图片...')
    
    // 下载图片
    this.downloadImage(link)
  },

  // 下载图片
  downloadImage(url) {
    wx.downloadFile({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) {
          app.hideLoading()
          
          // 创建临时文件信息
          const fileInfo = {
            tempFilePath: res.tempFilePath,
            size: res.header['Content-Length'] || 0,
            fileType: this.getImageType(url),
            name: this.getImageName(url),
            url: url
          }
          
          // 跳转到处理页面
          this.goToProcess(fileInfo)
        } else {
          throw new Error(`下载失败: ${res.statusCode}`)
        }
      },
      fail: (error) => {
        console.error('下载图片失败:', error)
        app.hideLoading()
        app.showError('下载图片失败，请检查链接是否有效')
      },
      complete: () => {
        this.setData({
          processing: false
        })
      }
    })
  },

  // 获取图片类型
  getImageType(url) {
    const extension = url.split('.').pop().toLowerCase()
    const typeMap = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp'
    }
    return typeMap[extension] || 'image/jpeg'
  },

  // 获取图片名称
  getImageName(url) {
    const pathname = new URL(url).pathname
    const filename = pathname.split('/').pop()
    return filename || 'image.jpg'
  },

  // 跳转到处理页面
  goToProcess(fileInfo) {
    const url = `/pages/process/process?data=${encodeURIComponent(JSON.stringify(fileInfo))}`
    wx.navigateTo({
      url: url
    })
  },

  // 查看最近处理记录
  viewRecentImage(e) {
    const index = e.currentTarget.dataset.index
    const image = this.data.recentImages[index]
    
    if (image.processedPath) {
      // 跳转到结果页面
      wx.navigateTo({
        url: `/pages/result/result?imageId=${image.id}`
      })
    } else {
      app.showError('该图片处理记录不存在')
    }
  },

  // 跳转到历史页面
  goToHistory() {
    wx.switchTab({
      url: '/pages/history/history'
    })
  },

  // 跳转到设置页面
  goToSettings() {
    wx.switchTab({
      url: '/pages/settings/settings'
    })
  },

  // 格式化时间
  formatTime(timestamp) {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return new Date(timestamp).toLocaleDateString()
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '智能去水印助手',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    }
  }
})