// pages/history/history.js
const app = getApp()

Page({
  data: {
    searchKeyword: '',
    filterType: 'all',
    history: [],
    filteredHistory: [],
    groupedHistory: [],
    stats: {
      total: 0,
      saved: 0,
      today: 0,
      thisWeek: 0
    }
  },

  onLoad() {
    this.loadHistory()
  },

  onShow() {
    this.loadHistory()
  },

  // 加载历史记录
  loadHistory() {
    try {
      const history = wx.getStorageSync('processHistory') || []
      this.setData({
        history: history
      })
      this.filterHistory()
      this.calculateStats()
    } catch (error) {
      console.error('加载历史记录失败:', error)
      app.showError('加载历史记录失败')
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
    this.filterHistory()
  },

  // 搜索确认
  onSearchConfirm() {
    this.filterHistory()
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      searchKeyword: ''
    })
    this.filterHistory()
  },

  // 过滤历史记录
  filterHistory(e) {
    let filterType = this.data.filterType
    
    if (e) {
      filterType = e.currentTarget.dataset.type
      this.setData({
        filterType: filterType
      })
    }
    
    let filtered = [...this.data.history]
    
    // 按类型过滤
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    const oneWeek = 7 * oneDay
    const oneMonth = 30 * oneDay
    
    switch (filterType) {
      case 'today':
        filtered = filtered.filter(item => now - item.timestamp < oneDay)
        break
      case 'week':
        filtered = filtered.filter(item => now - item.timestamp < oneWeek)
        break
      case 'month':
        filtered = filtered.filter(item => now - item.timestamp < oneMonth)
        break
    }
    
    // 按关键词搜索
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(keyword) ||
        (item.url && item.url.toLowerCase().includes(keyword))
      )
    }
    
    // 按时间倒序排列
    filtered.sort((a, b) => b.timestamp - a.timestamp)
    
    this.setData({
      filteredHistory: filtered
    })
    
    this.groupHistoryByDate()
  },

  // 按日期分组
  groupHistoryByDate() {
    const grouped = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    this.data.filteredHistory.forEach(item => {
      const itemDate = new Date(item.timestamp)
      itemDate.setHours(0, 0, 0, 0)
      
      let dateKey
      const diffDays = Math.floor((today - itemDate) / (24 * 60 * 60 * 1000))
      
      if (diffDays === 0) {
        dateKey = '今天'
      } else if (diffDays === 1) {
        dateKey = '昨天'
      } else if (diffDays < 7) {
        dateKey = `${diffDays}天前`
      } else {
        dateKey = itemDate.toLocaleDateString()
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(item)
    })
    
    const groupedArray = Object.keys(grouped).map(date => ({
      date: date,
      items: grouped[date]
    }))
    
    this.setData({
      groupedHistory: groupedArray
    })
  },

  // 计算统计信息
  calculateStats() {
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    const oneWeek = 7 * oneDay
    
    const stats = {
      total: this.data.history.length,
      saved: this.data.history.filter(item => item.saved).length,
      today: this.data.history.filter(item => now - item.timestamp < oneDay).length,
      thisWeek: this.data.history.filter(item => now - item.timestamp < oneWeek).length
    }
    
    this.setData({
      stats: stats
    })
  },

  // 查看历史记录项
  viewHistoryItem(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.history.find(h => h.id === id)
    
    if (item) {
      app.globalData.currentImage = item
      wx.navigateTo({
        url: `/pages/result/result?imageId=${id}`
      })
    }
  },

  // 保存图片
  saveImage(e) {
    e.stopPropagation()
    
    const id = e.currentTarget.dataset.id
    const item = this.data.history.find(h => h.id === id)
    
    if (!item) return
    
    if (item.saved) {
      app.showSuccess('图片已保存')
      return
    }
    
    wx.showLoading({
      title: '保存中...'
    })
    
    wx.saveImageToPhotosAlbum({
      filePath: item.processedPath || item.originalPath,
      success: () => {
        wx.hideLoading()
        
        // 更新保存状态
        this.updateSaveStatus(id)
        
        app.showSuccess('保存成功')
      },
      fail: (error) => {
        console.error('保存失败:', error)
        wx.hideLoading()
        app.showError('保存失败')
      }
    })
  },

  // 更新保存状态
  updateSaveStatus(id) {
    try {
      const history = this.data.history.map(item => {
        if (item.id === id) {
          return {
            ...item,
            saved: true,
            savedTime: Date.now()
          }
        }
        return item
      })
      
      wx.setStorageSync('processHistory', history)
      
      this.setData({
        history: history
      })
      
      this.filterHistory()
      this.calculateStats()
      
    } catch (error) {
      console.error('更新保存状态失败:', error)
    }
  },

  // 分享图片
  shareImage(e) {
    e.stopPropagation()
    
    const id = e.currentTarget.dataset.id
    const item = this.data.history.find(h => h.id === id)
    
    if (!item) return
    
    const imagePath = item.processedPath || item.originalPath
    
    if (!imagePath) {
      app.showError('图片路径不存在')
      return
    }
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 删除图片
  deleteImage(e) {
    e.stopPropagation()
    
    const id = e.currentTarget.dataset.id
    const item = this.data.history.find(h => h.id === id)
    
    if (!item) return
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteHistoryItem(id)
        }
      }
    })
  },

  // 删除历史记录项
  deleteHistoryItem(id) {
    try {
      const history = this.data.history.filter(item => item.id !== id)
      wx.setStorageSync('processHistory', history)
      
      this.setData({
        history: history
      })
      
      this.filterHistory()
      this.calculateStats()
      
      app.showSuccess('删除成功')
      
    } catch (error) {
      console.error('删除失败:', error)
      app.showError('删除失败')
    }
  },

  // 清空所有历史记录
  clearAllHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          this.clearHistory()
        }
      }
    })
  },

  // 清空历史记录
  clearHistory() {
    try {
      wx.setStorageSync('processHistory', [])
      
      this.setData({
        history: [],
        filteredHistory: [],
        groupedHistory: [],
        stats: {
          total: 0,
          saved: 0,
          today: 0,
          thisWeek: 0
        }
      })
      
      app.showSuccess('清空成功')
      
    } catch (error) {
      console.error('清空失败:', error)
      app.showError('清空失败')
    }
  },

  // 获取质量文本
  getQualityText(quality) {
    const qualityMap = {
      'low': '标准',
      'medium': '高清',
      'high': '超清'
    }
    return qualityMap[quality] || '标准'
  },

  // 格式化文件大小
  formatFileSize(bytes) {
    if (!bytes) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  // 跳转到首页
  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 跳转到设置页面
  goToSettings() {
    wx.switchTab({
      url: '/pages/settings/settings'
    })
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