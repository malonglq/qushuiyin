// pages/process/process.js
const app = getApp()

Page({
  data: {
    imageInfo: null,
    processing: false,
    progress: 0,
    statusText: '',
    processMode: 'auto',
    intensity: 5,
    quality: 'high',
    watermarkDetected: false,
    watermarkBoxStyle: '',
    processLogs: []
  },

  onLoad(options) {
    // 接收从首页传递的图片信息
    if (options.data) {
      try {
        const imageInfo = JSON.parse(decodeURIComponent(options.data))
        this.setData({
          imageInfo: imageInfo
        })
        this.addLog('info', '图片加载成功')
        this.detectWatermark()
      } catch (error) {
        console.error('解析图片信息失败:', error)
        app.showError('图片信息解析失败')
        wx.navigateBack()
      }
    }
  },

  // 添加处理日志
  addLog(type, message) {
    const log = {
      time: new Date().toLocaleTimeString(),
      type: type,
      message: message
    }
    
    this.setData({
      processLogs: [...this.data.processLogs, log]
    })
    
    // 保持日志数量在合理范围内
    if (this.data.processLogs.length > 50) {
      this.setData({
        processLogs: this.data.processLogs.slice(-50)
      })
    }
  },

  // 检测水印
  detectWatermark() {
    this.addLog('info', '开始检测水印...')
    
    // 模拟水印检测过程
    setTimeout(() => {
      // 这里应该集成实际的图像识别算法
      const hasWatermark = Math.random() > 0.3 // 70%概率检测到水印
      
      if (hasWatermark) {
        this.setData({
          watermarkDetected: true,
          watermarkBoxStyle: {
            top: '50rpx',
            left: '50rpx',
            width: '200rpx',
            height: '60rpx'
          }
        })
        this.addLog('success', '检测到水印位置')
      } else {
        this.addLog('warning', '未检测到明显水印')
      }
    }, 1000)
  },

  // 选择处理模式
  selectProcessMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      processMode: mode
    })
    this.addLog('info', `切换到${mode === 'auto' ? '自动识别' : '手动选择'}模式`)
  },

  // 处理强度变化
  onIntensityChange(e) {
    this.setData({
      intensity: e.detail.value
    })
    this.addLog('info', `处理强度调整为: ${e.detail.value}`)
  },

  // 选择输出质量
  selectQuality(e) {
    const quality = e.currentTarget.dataset.quality
    this.setData({
      quality: quality
    })
    this.addLog('info', `输出质量设置为: ${quality === 'low' ? '标准' : quality === 'medium' ? '高清' : '超清'}`)
  },

  // 开始处理
  startProcessing() {
    if (!this.data.imageInfo) {
      app.showError('请先选择图片')
      return
    }
    
    this.setData({
      processing: true,
      progress: 0,
      statusText: '正在初始化...'
    })
    
    this.addLog('info', '开始去水印处理...')
    
    // 开始处理流程
    this.processImage()
  },

  // 处理图片
  async processImage() {
    try {
      // 步骤1: 加载图片
      await this.loadImage()
      
      // 步骤2: 分析图片
      await this.analyzeImage()
      
      // 步骤3: 检测水印
      await this.detectWatermarkAdvanced()
      
      // 步骤4: 去除水印
      await this.removeWatermark()
      
      // 步骤5: 优化图片
      await this.optimizeImage()
      
      // 步骤6: 保存结果
      await this.saveResult()
      
      this.setData({
        processing: false,
        progress: 100,
        statusText: '处理完成'
      })
      
      this.addLog('success', '去水印处理完成')
      
      // 跳转到结果页面
      setTimeout(() => {
        this.goToResult()
      }, 1000)
      
    } catch (error) {
      console.error('处理失败:', error)
      this.setData({
        processing: false,
        statusText: '处理失败'
      })
      this.addLog('error', `处理失败: ${error.message}`)
      app.showError('处理失败，请重试')
    }
  },

  // 加载图片
  loadImage() {
    return new Promise((resolve, reject) => {
      this.updateProgress(10, '正在加载图片...')
      this.addLog('info', '加载图片到画布')
      
      setTimeout(() => {
        resolve()
      }, 500)
    })
  },

  // 分析图片
  analyzeImage() {
    return new Promise((resolve, reject) => {
      this.updateProgress(25, '正在分析图片...')
      this.addLog('info', '分析图片特征和结构')
      
      setTimeout(() => {
        resolve()
      }, 800)
    })
  },

  // 高级水印检测
  detectWatermarkAdvanced() {
    return new Promise((resolve, reject) => {
      this.updateProgress(40, '正在检测水印...')
      this.addLog('info', '使用AI算法检测水印位置')
      
      setTimeout(() => {
        // 模拟检测结果
        const watermarkInfo = {
          detected: true,
          positions: [
            { x: 100, y: 50, width: 200, height: 60 },
            { x: 300, y: 300, width: 150, height: 40 }
          ]
        }
        
        this.setData({
          watermarkDetected: watermarkInfo.detected
        })
        
        this.addLog('success', `检测到${watermarkInfo.positions.length}个水印区域`)
        resolve()
      }, 1200)
    })
  },

  // 去除水印
  removeWatermark() {
    return new Promise((resolve, reject) => {
      this.updateProgress(60, '正在去除水印...')
      this.addLog('info', '应用去水印算法')
      
      setTimeout(() => {
        this.updateProgress(80, '正在优化处理结果...')
        this.addLog('info', '使用图像修复技术填补水印区域')
        
        setTimeout(() => {
          resolve()
        }, 1000)
      }, 1500)
    })
  },

  // 优化图片
  optimizeImage() {
    return new Promise((resolve, reject) => {
      this.updateProgress(90, '正在优化图片...')
      this.addLog('info', '优化图片质量和清晰度')
      
      setTimeout(() => {
        resolve()
      }, 800)
    })
  },

  // 保存结果
  saveResult() {
    return new Promise((resolve, reject) => {
      this.updateProgress(95, '正在保存结果...')
      this.addLog('info', '保存处理后的图片')
      
      // 生成处理结果信息
      const resultInfo = {
        id: Date.now().toString(),
        originalPath: this.data.imageInfo.tempFilePath,
        processedPath: this.data.imageInfo.tempFilePath, // 实际应该是处理后的路径
        name: this.data.imageInfo.name,
        size: this.data.imageInfo.size,
        quality: this.data.quality,
        intensity: this.data.intensity,
        processMode: this.data.processMode,
        processTime: Date.now(),
        timestamp: Date.now()
      }
      
      // 保存到本地存储
      try {
        let history = wx.getStorageSync('processHistory') || []
        history.unshift(resultInfo)
        
        // 只保留最近100条记录
        if (history.length > 100) {
          history = history.slice(0, 100)
        }
        
        wx.setStorageSync('processHistory', history)
        
        // 保存到全局数据
        app.globalData.currentImage = resultInfo
        app.globalData.processedImages.push(resultInfo)
        
        this.addLog('success', '结果保存成功')
        resolve()
        
      } catch (error) {
        reject(new Error('保存结果失败'))
      }
    })
  },

  // 更新进度
  updateProgress(progress, statusText) {
    this.setData({
      progress: progress,
      statusText: statusText
    })
  },

  // 取消处理
  cancelProcessing() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消当前处理吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            processing: false,
            progress: 0,
            statusText: ''
          })
          this.addLog('warning', '用户取消了处理')
        }
      }
    })
  },

  // 重置选项
  resetOptions() {
    this.setData({
      processMode: 'auto',
      intensity: 5,
      quality: 'high',
      watermarkDetected: false,
      watermarkBoxStyle: '',
      processLogs: []
    })
    this.addLog('info', '选项已重置')
    this.detectWatermark()
  },

  // 返回上一页
  goBack() {
    if (this.data.processing) {
      wx.showModal({
        title: '确认返回',
        content: '处理正在进行中，确定要返回吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
    } else {
      wx.navigateBack()
    }
  },

  // 跳转到结果页面
  goToResult() {
    if (app.globalData.currentImage) {
      wx.navigateTo({
        url: `/pages/result/result?imageId=${app.globalData.currentImage.id}`
      })
    } else {
      app.showError('处理结果不存在')
    }
  },

  // 格式化文件大小
  formatFileSize(bytes) {
    if (!bytes) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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