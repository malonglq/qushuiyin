// app.js
App({
  globalData: {
    userInfo: null,
    systemInfo: null,
    isProcessing: false,
    currentImage: null,
    processedImages: [],
    settings: {
      outputQuality: 'high',
      autoSave: true,
      batchProcessing: true
    }
  },

  onLaunch() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo
    
    // 初始化本地存储
    this.initStorage()
    
    // 检查剪贴板
    this.checkClipboard()
    
    console.log('去水印小程序启动成功')
  },

  // 初始化本地存储
  initStorage() {
    try {
      // 检查是否已有设置
      const settings = wx.getStorageSync('appSettings')
      if (settings) {
        this.globalData.settings = { ...this.globalData.settings, ...settings }
      } else {
        // 保存默认设置
        wx.setStorageSync('appSettings', this.globalData.settings)
      }
      
      // 初始化处理历史
      const history = wx.getStorageSync('processHistory')
      if (!history) {
        wx.setStorageSync('processHistory', [])
      }
      
    } catch (error) {
      console.error('初始化存储失败:', error)
    }
  },

  // 检查剪贴板
  checkClipboard() {
    wx.getClipboardData({
      success: (res) => {
        const data = res.data
        if (this.isImageUrl(data)) {
          this.globalData.clipboardImage = data
          console.log('检测到图片链接:', data)
        }
      },
      fail: (error) => {
        console.log('剪贴板检查失败:', error)
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

  // 保存处理历史
  saveProcessHistory(imageInfo) {
    try {
      let history = wx.getStorageSync('processHistory') || []
      history.unshift({
        ...imageInfo,
        timestamp: Date.now(),
        date: new Date().toLocaleString()
      })
      
      // 只保留最近100条记录
      if (history.length > 100) {
        history = history.slice(0, 100)
      }
      
      wx.setStorageSync('processHistory', history)
    } catch (error) {
      console.error('保存历史记录失败:', error)
    }
  },

  // 获取处理历史
  getProcessHistory() {
    try {
      return wx.getStorageSync('processHistory') || []
    } catch (error) {
      console.error('获取历史记录失败:', error)
      return []
    }
  },

  // 清空处理历史
  clearProcessHistory() {
    try {
      wx.setStorageSync('processHistory', [])
      return true
    } catch (error) {
      console.error('清空历史记录失败:', error)
      return false
    }
  },

  // 更新设置
  updateSettings(newSettings) {
    try {
      this.globalData.settings = { ...this.globalData.settings, ...newSettings }
      wx.setStorageSync('appSettings', this.globalData.settings)
      return true
    } catch (error) {
      console.error('更新设置失败:', error)
      return false
    }
  },

  // 显示错误提示
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'error',
      duration: 2000
    })
  },

  // 显示成功提示
  showSuccess(message) {
    wx.showToast({
      title: message,
      icon: 'success',
      duration: 2000
    })
  },

  // 显示加载提示
  showLoading(title = '处理中...') {
    wx.showLoading({
      title: title,
      mask: true
    })
  },

  // 隐藏加载提示
  hideLoading() {
    wx.hideLoading()
  }
})