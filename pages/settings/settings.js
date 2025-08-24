// pages/settings/settings.js
const app = getApp()

Page({
  data: {
    userInfo: {
      nickname: '用户',
      avatar: '/images/default-avatar.png',
      membership: 'normal' // 'normal' 或 'vip'
    },
    appVersion: '1.0.0',
    cacheSize: '0 MB',
    settings: {
      processMode: 'auto',
      quality: 'high',
      intensity: 5,
      batchProcessing: true,
      autoSave: false,
      processNotification: true,
      updateNotification: true
    },
    processModeOptions: ['自动识别', '手动选择'],
    processModeIndex: 0,
    qualityOptions: ['标准', '高清', '超清'],
    qualityIndex: 2
  },

  onLoad() {
    this.loadSettings()
    this.calculateCacheSize()
  },

  onShow() {
    this.loadSettings()
  },

  // 加载设置
  loadSettings() {
    try {
      const settings = wx.getStorageSync('appSettings') || {}
      const userInfo = wx.getStorageSync('userInfo') || this.data.userInfo
      
      this.setData({
        settings: { ...this.data.settings, ...settings },
        userInfo: userInfo
      })
      
      // 更新选择器索引
      const processModeIndex = this.data.processModeOptions.indexOf(settings.processMode) || 0
      const qualityIndex = this.data.qualityOptions.indexOf(this.getQualityText(settings.quality)) || 2
      
      this.setData({
        processModeIndex: processModeIndex,
        qualityIndex: qualityIndex
      })
      
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  },

  // 计算缓存大小
  calculateCacheSize() {
    try {
      // 这里应该计算实际的缓存大小
      // 目前使用模拟数据
      const cacheSize = Math.floor(Math.random() * 100) + 10
      this.setData({
        cacheSize: `${cacheSize} MB`
      })
    } catch (error) {
      console.error('计算缓存大小失败:', error)
    }
  },

  // 处理模式变更
  onProcessModeChange(e) {
    const index = e.detail.value
    const mode = index === '0' ? 'auto' : 'manual'
    
    this.setData({
      processModeIndex: index
    })
    
    this.updateSetting('processMode', mode)
  },

  // 质量设置变更
  onQualityChange(e) {
    const index = e.detail.value
    const qualityMap = ['low', 'medium', 'high']
    const quality = qualityMap[index]
    
    this.setData({
      qualityIndex: index
    })
    
    this.updateSetting('quality', quality)
  },

  // 强度设置变更
  onIntensityChange(e) {
    const intensity = parseInt(e.detail.value)
    this.updateSetting('intensity', intensity)
  },

  // 批量处理设置变更
  onBatchProcessingChange(e) {
    const batchProcessing = e.detail.value
    this.updateSetting('batchProcessing', batchProcessing)
  },

  // 自动保存设置变更
  onAutoSaveChange(e) {
    const autoSave = e.detail.value
    this.updateSetting('autoSave', autoSave)
  },

  // 处理通知设置变更
  onProcessNotificationChange(e) {
    const processNotification = e.detail.value
    this.updateSetting('processNotification', processNotification)
  },

  // 更新通知设置变更
  onUpdateNotificationChange(e) {
    const updateNotification = e.detail.value
    this.updateSetting('updateNotification', updateNotification)
  },

  // 更新单个设置
  updateSetting(key, value) {
    try {
      const settings = { ...this.data.settings, [key]: value }
      wx.setStorageSync('appSettings', settings)
      
      this.setData({
        settings: settings
      })
      
      // 更新全局设置
      app.globalData.settings = settings
      
      app.showSuccess('设置已更新')
      
    } catch (error) {
      console.error('更新设置失败:', error)
      app.showError('设置更新失败')
    }
  },

  // 获取质量文本
  getQualityText(quality) {
    const qualityMap = {
      'low': '标准',
      'medium': '高清',
      'high': '超清'
    }
    return qualityMap[quality] || '超清'
  },

  // 跳转到个人资料
  goToProfile() {
    wx.showModal({
      title: '功能开发中',
      content: '个人资料功能正在开发中，敬请期待！',
      showCancel: false
    })
  },

  // 跳转到会员页面
  goToMembership() {
    wx.showModal({
      title: '功能开发中',
      content: '会员功能正在开发中，敬请期待！',
      showCancel: false
    })
  },

  // 清理缓存
  clearCache() {
    wx.showModal({
      title: '确认清理',
      content: '确定要清理缓存吗？清理后可能需要重新加载数据。',
      success: (res) => {
        if (res.confirm) {
          this.clearCacheData()
        }
      }
    })
  },

  // 清理缓存数据
  clearCacheData() {
    wx.showLoading({
      title: '清理中...'
    })
    
    try {
      // 这里应该清理实际的缓存数据
      // 目前模拟清理过程
      setTimeout(() => {
        wx.hideLoading()
        this.setData({
          cacheSize: '0 MB'
        })
        app.showSuccess('缓存清理成功')
      }, 1500)
      
    } catch (error) {
      console.error('清理缓存失败:', error)
      wx.hideLoading()
      app.showError('清理缓存失败')
    }
  },

  // 管理历史记录
  manageHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    })
  },

  // 跳转到关于页面
  goToAbout() {
    wx.showModal({
      title: '关于我们',
      content: '智能去水印助手 v1.0.0\n\n一款专业的图片去水印工具，支持多种去水印算法，让您轻松去除图片中的水印。\n\n© 2025 智能去水印助手',
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 跳转到隐私政策
  goToPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们非常重视您的隐私保护。\n\n1. 本应用所有图片处理均在本地完成，不会上传到服务器。\n2. 不会收集您的个人信息。\n3. 处理历史记录仅保存在本地设备中。\n4. 您可以随时清理历史记录和缓存数据。',
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 跳转到反馈页面
  goToFeedback() {
    wx.showModal({
      title: '用户反馈',
      content: '如有任何问题或建议，请通过以下方式联系我们：\n\n邮箱：support@example.com\n微信群：扫描二维码加入\n\n感谢您的支持！',
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 分享应用
  shareApp() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 重置设置
  resetSettings() {
    wx.showModal({
      title: '确认重置',
      content: '确定要恢复默认设置吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          this.resetAllSettings()
        }
      }
    })
  },

  // 重置所有设置
  resetAllSettings() {
    try {
      const defaultSettings = {
        processMode: 'auto',
        quality: 'high',
        intensity: 5,
        batchProcessing: true,
        autoSave: false,
        processNotification: true,
        updateNotification: true
      }
      
      wx.setStorageSync('appSettings', defaultSettings)
      
      this.setData({
        settings: defaultSettings,
        processModeIndex: 0,
        qualityIndex: 2
      })
      
      // 更新全局设置
      app.globalData.settings = defaultSettings
      
      app.showSuccess('设置已重置')
      
    } catch (error) {
      console.error('重置设置失败:', error)
      app.showError('重置设置失败')
    }
  },

  // 跳转到首页
  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 跳转到历史页面
  goToHistory() {
    wx.switchTab({
      url: '/pages/history/history'
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '智能去水印助手 - 一键去除图片水印',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '智能去水印助手 - 一键去除图片水印',
      query: '',
      imageUrl: '/images/share.png'
    }
  }
})