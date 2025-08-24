// pages/result/result.js
const app = getApp()

Page({
  data: {
    imageInfo: null,
    compareMode: 'after', // 'before', 'after', 'slider'
    sliderPosition: 50,
    qualityScore: 4.8,
    processTime: 2.3,
    saving: false,
    recommendImages: []
  },

  onLoad(options) {
    // 获取图片信息
    if (options.imageId) {
      this.loadImageInfo(options.imageId)
    } else if (app.globalData.currentImage) {
      this.setData({
        imageInfo: app.globalData.currentImage
      })
      this.generateRecommendations()
    } else {
      app.showError('图片信息不存在')
      wx.navigateBack()
    }
  },

  onShow() {
    // 页面显示时的处理
    this.calculateQualityScore()
  },

  // 加载图片信息
  loadImageInfo(imageId) {
    try {
      const history = wx.getStorageSync('processHistory') || []
      const imageInfo = history.find(item => item.id === imageId)
      
      if (imageInfo) {
        this.setData({
          imageInfo: imageInfo
        })
        this.generateRecommendations()
      } else {
        app.showError('图片信息不存在')
        wx.navigateBack()
      }
    } catch (error) {
      console.error('加载图片信息失败:', error)
      app.showError('加载图片信息失败')
      wx.navigateBack()
    }
  },

  // 生成推荐图片
  generateRecommendations() {
    try {
      const history = wx.getStorageSync('processHistory') || []
      const recommend = history
        .filter(item => item.id !== this.data.imageInfo.id)
        .slice(0, 4)
        .map(item => ({
          ...item,
          thumbnail: item.originalPath,
          time: this.formatTime(item.timestamp)
        }))
      
      this.setData({
        recommendImages: recommend
      })
    } catch (error) {
      console.error('生成推荐失败:', error)
    }
  },

  // 切换对比模式
  switchCompare(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      compareMode: mode
    })
  },

  // 滑动对比处理
  onSliderMove(e) {
    if (this.data.compareMode !== 'slider') return
    
    const touch = e.touches[0]
    const container = e.currentTarget
    const rect = container.getBoundingClientRect()
    
    // 计算滑动位置百分比
    const x = touch.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    
    this.setData({
      sliderPosition: percentage
    })
  },

  // 计算质量评分
  calculateQualityScore() {
    // 基于处理参数计算质量评分
    let score = 4.0 // 基础分数
    
    // 根据质量设置调整分数
    const qualityBonus = {
      'low': 0.3,
      'medium': 0.6,
      'high': 1.0
    }
    
    score += qualityBonus[this.data.imageInfo?.quality] || 0
    
    // 根据处理强度调整分数
    const intensity = this.data.imageInfo?.intensity || 5
    score += (intensity - 5) * 0.1
    
    // 根据处理模式调整分数
    if (this.data.imageInfo?.processMode === 'auto') {
      score += 0.2
    }
    
    // 确保分数在合理范围内
    score = Math.max(1.0, Math.min(5.0, score))
    
    this.setData({
      qualityScore: score.toFixed(1)
    })
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

  // 保存图片
  saveImage() {
    if (this.data.saving) return
    
    this.setData({
      saving: true
    })
    
    wx.showLoading({
      title: '保存中...'
    })
    
    // 检查权限
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          // 请求权限
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              this.saveToAlbum()
            },
            fail: () => {
              this.showAuthDialog()
            }
          })
        } else {
          this.saveToAlbum()
        }
      },
      fail: (error) => {
        console.error('获取设置失败:', error)
        this.saveError('获取权限失败')
      }
    })
  },

  // 保存到相册
  saveToAlbum() {
    const imagePath = this.data.imageInfo?.processedPath
    
    if (!imagePath) {
      this.saveError('图片路径不存在')
      return
    }
    
    wx.saveImageToPhotosAlbum({
      filePath: imagePath,
      success: () => {
        wx.hideLoading()
        this.setData({
          saving: false
        })
        
        // 更新保存状态
        this.updateSaveStatus()
        
        wx.showModal({
          title: '保存成功',
          content: '图片已保存到相册',
          showCancel: false,
          confirmText: '确定'
        })
      },
      fail: (error) => {
        console.error('保存失败:', error)
        this.saveError('保存到相册失败')
      }
    })
  },

  // 显示权限对话框
  showAuthDialog() {
    wx.showModal({
      title: '权限请求',
      content: '需要相册权限才能保存图片，请前往设置开启权限',
      confirmText: '去设置',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting()
        } else {
          this.saveError('需要相册权限')
        }
      }
    })
  },

  // 保存错误处理
  saveError(message) {
    wx.hideLoading()
    this.setData({
      saving: false
    })
    app.showError(message)
  },

  // 更新保存状态
  updateSaveStatus() {
    try {
      const history = wx.getStorageSync('processHistory') || []
      const updatedHistory = history.map(item => {
        if (item.id === this.data.imageInfo.id) {
          return {
            ...item,
            saved: true,
            savedTime: Date.now()
          }
        }
        return item
      })
      
      wx.setStorageSync('processHistory', updatedHistory)
      
      // 更新当前图片信息
      this.setData({
        imageInfo: {
          ...this.data.imageInfo,
          saved: true,
          savedTime: Date.now()
        }
      })
      
    } catch (error) {
      console.error('更新保存状态失败:', error)
    }
  },

  // 分享图片
  shareImage() {
    const imagePath = this.data.imageInfo?.processedPath
    
    if (!imagePath) {
      app.showError('图片路径不存在')
      return
    }
    
    // 显示分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 重新编辑
  reprocessImage() {
    const originalPath = this.data.imageInfo?.originalPath
    
    if (!originalPath) {
      app.showError('原图路径不存在')
      return
    }
    
    // 重新创建文件信息
    const fileInfo = {
      tempFilePath: originalPath,
      size: this.data.imageInfo.size,
      fileType: 'image/jpeg',
      name: this.data.imageInfo.name,
      url: this.data.imageInfo.url
    }
    
    // 跳转到处理页面
    const url = `/pages/process/process?data=${encodeURIComponent(JSON.stringify(fileInfo))}`
    wx.navigateTo({
      url: url
    })
  },

  // 处理推荐图片
  processRecommend(e) {
    const index = e.currentTarget.dataset.index
    const recommend = this.data.recommendImages[index]
    
    if (recommend.originalPath) {
      const fileInfo = {
        tempFilePath: recommend.originalPath,
        size: recommend.size,
        fileType: 'image/jpeg',
        name: recommend.name,
        url: recommend.url
      }
      
      const url = `/pages/process/process?data=${encodeURIComponent(JSON.stringify(fileInfo))}`
      wx.navigateTo({
        url: url
      })
    }
  },

  // 返回首页
  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
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
      title: '我刚刚用智能去水印助手处理了一张图片',
      path: '/pages/index/index',
      imageUrl: this.data.imageInfo?.processedPath
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '智能去水印助手 - 一键去除图片水印',
      query: '',
      imageUrl: this.data.imageInfo?.processedPath
    }
  }
})