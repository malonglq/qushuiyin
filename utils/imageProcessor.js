// utils/imageProcessor.js
/**
 * 图片处理工具类
 * 负责图片的加载、处理、去水印等核心功能
 */

class ImageProcessor {
  constructor() {
    this.canvas = null
    this.ctx = null
    this.isInitialized = false
  }

  // 初始化画布
  async init() {
    if (this.isInitialized) return true
    
    try {
      // 创建离屏画布
      this.canvas = wx.createOffscreenCanvas({ type: '2d' })
      this.ctx = this.canvas.getContext('2d')
      
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('初始化图片处理器失败:', error)
      return false
    }
  }

  // 加载图片
  async loadImage(imagePath) {
    try {
      const image = this.canvas.createImage()
      
      return new Promise((resolve, reject) => {
        image.onload = () => {
          resolve(image)
        }
        
        image.onerror = (error) => {
          reject(new Error('图片加载失败'))
        }
        
        image.src = imagePath
      })
    } catch (error) {
      console.error('加载图片失败:', error)
      throw error
    }
  }

  // 调整图片大小
  async resizeImage(image, maxWidth = 1024, maxHeight = 1024) {
    try {
      let { width, height } = image
      
      // 计算缩放比例
      const scale = Math.min(maxWidth / width, maxHeight / height, 1)
      
      if (scale < 1) {
        width = Math.floor(width * scale)
        height = Math.floor(height * scale)
      }
      
      // 设置画布大小
      this.canvas.width = width
      this.canvas.height = height
      
      // 绘制图片
      this.ctx.clearRect(0, 0, width, height)
      this.ctx.drawImage(image, 0, 0, width, height)
      
      // 返回调整后的图片数据
      return {
        width: width,
        height: height,
        dataUrl: this.canvas.toDataURL('image/jpeg', 0.9)
      }
    } catch (error) {
      console.error('调整图片大小失败:', error)
      throw error
    }
  }

  // 检测水印
  async detectWatermark(image) {
    try {
      // 这里应该集成实际的水印检测算法
      // 目前使用模拟检测
      
      const { width, height } = image
      
      // 模拟水印检测结果
      const watermarks = []
      
      // 随机生成一些水印位置（实际应该使用AI算法）
      if (Math.random() > 0.3) {
        watermarks.push({
          x: Math.floor(width * 0.1),
          y: Math.floor(height * 0.1),
          width: Math.floor(width * 0.3),
          height: Math.floor(height * 0.1),
          confidence: 0.85
        })
      }
      
      if (Math.random() > 0.5) {
        watermarks.push({
          x: Math.floor(width * 0.6),
          y: Math.floor(height * 0.8),
          width: Math.floor(width * 0.25),
          height: Math.floor(height * 0.08),
          confidence: 0.92
        })
      }
      
      return {
        detected: watermarks.length > 0,
        watermarks: watermarks,
        confidence: watermarks.length > 0 ? 
          Math.max(...watermarks.map(w => w.confidence)) : 0
      }
    } catch (error) {
      console.error('检测水印失败:', error)
      throw error
    }
  }

  // 去除水印
  async removeWatermark(image, watermarks, options = {}) {
    try {
      const {
        intensity = 5,
        quality = 'high',
        mode = 'auto'
      } = options
      
      // 设置画布大小
      this.canvas.width = image.width
      this.canvas.height = image.height
      
      // 绘制原图
      this.ctx.clearRect(0, 0, image.width, image.height)
      this.ctx.drawImage(image, 0, 0, image.width, image.height)
      
      // 对每个水印区域进行处理
      for (const watermark of watermarks) {
        await this.processWatermarkRegion(watermark, intensity)
      }
      
      // 获取处理后的图片
      const qualityMap = {
        'low': 0.7,
        'medium': 0.85,
        'high': 0.95
      }
      
      const jpegQuality = qualityMap[quality] || 0.9
      
      return {
        width: image.width,
        height: image.height,
        dataUrl: this.canvas.toDataURL('image/jpeg', jpegQuality),
        processedAt: Date.now()
      }
    } catch (error) {
      console.error('去除水印失败:', error)
      throw error
    }
  }

  // 处理水印区域
  async processWatermarkRegion(watermark, intensity) {
    try {
      const { x, y, width, height } = watermark
      
      // 获取水印区域的图像数据
      const imageData = this.ctx.getImageData(x, y, width, height)
      const data = imageData.data
      
      // 根据强度应用不同的处理算法
      switch (intensity) {
        case 1:
        case 2:
        case 3:
          this.applyLightInpainting(data, width, height)
          break
        case 4:
        case 5:
        case 6:
          this.applyMediumInpainting(data, width, height)
          break
        case 7:
        case 8:
        case 9:
        case 10:
          this.applyStrongInpainting(data, width, height)
          break
      }
      
      // 将处理后的数据放回画布
      this.ctx.putImageData(imageData, x, y)
      
    } catch (error) {
      console.error('处理水印区域失败:', error)
      throw error
    }
  }

  // 轻柔修复算法
  applyLightInpainting(data, width, height) {
    // 简单的模糊处理
    const kernel = [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1]
    ]
    
    this.applyConvolution(data, width, height, kernel, 16)
  }

  // 中等修复算法
  applyMediumInpainting(data, width, height) {
    // 使用边缘保持的修复算法
    for (let i = 0; i < 3; i++) {
      this.applyBilateralFilter(data, width, height)
    }
  }

  // 强力修复算法
  applyStrongInpainting(data, width, height) {
    // 使用更强的修复算法
    for (let i = 0; i < 5; i++) {
      this.applySmartInpainting(data, width, height)
    }
  }

  // 应用卷积核
  applyConvolution(data, width, height, kernel, divisor) {
    const output = new Uint8ClampedArray(data)
    const half = Math.floor(kernel.length / 2)
    
    for (let y = half; y < height - half; y++) {
      for (let x = half; x < width - half; x++) {
        let r = 0, g = 0, b = 0
        
        for (let ky = 0; ky < kernel.length; ky++) {
          for (let kx = 0; kx < kernel[ky].length; kx++) {
            const px = x + kx - half
            const py = y + ky - half
            const pi = (py * width + px) * 4
            
            r += data[pi] * kernel[ky][kx]
            g += data[pi + 1] * kernel[ky][kx]
            b += data[pi + 2] * kernel[ky][kx]
          }
        }
        
        const i = (y * width + x) * 4
        output[i] = r / divisor
        output[i + 1] = g / divisor
        output[i + 2] = b / divisor
      }
    }
    
    // 复制回原数组
    for (let i = 0; i < data.length; i++) {
      data[i] = output[i]
    }
  }

  // 应用双边滤波
  applyBilateralFilter(data, width, height) {
    const output = new Uint8ClampedArray(data)
    const sigmaSpatial = 2
    const sigmaIntensity = 30
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0
        let weightSum = 0
        
        const centerI = (y * width + x) * 4
        const centerR = data[centerI]
        const centerG = data[centerI + 1]
        const centerB = data[centerI + 2]
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx
            const ny = y + dy
            const ni = (ny * width + nx) * 4
            
            const spatialWeight = Math.exp(-(dx * dx + dy * dy) / (2 * sigmaSpatial * sigmaSpatial))
            
            const colorDiff = Math.abs(data[ni] - centerR) + 
                             Math.abs(data[ni + 1] - centerG) + 
                             Math.abs(data[ni + 2] - centerB)
            const intensityWeight = Math.exp(-colorDiff * colorDiff / (2 * sigmaIntensity * sigmaIntensity))
            
            const weight = spatialWeight * intensityWeight
            
            r += data[ni] * weight
            g += data[ni + 1] * weight
            b += data[ni + 2] * weight
            weightSum += weight
          }
        }
        
        const i = (y * width + x) * 4
        output[i] = r / weightSum
        output[i + 1] = g / weightSum
        output[i + 2] = b / weightSum
      }
    }
    
    // 复制回原数组
    for (let i = 0; i < data.length; i++) {
      data[i] = output[i]
    }
  }

  // 智能修复算法
  applySmartInpainting(data, width, height) {
    // 使用基于边缘的智能修复
    this.applyEdgePreservingSmoothing(data, width, height)
  }

  // 边缘保持平滑
  applyEdgePreservingSmoothing(data, width, height) {
    const output = new Uint8ClampedArray(data)
    const lambda = 0.1
    
    for (let iter = 0; iter < 3; iter++) {
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const i = (y * width + x) * 4
          
          // 计算梯度
          const gradX = Math.abs(data[((y * width + x + 1) * 4)] - data[((y * width + x - 1) * 4)])
          const gradY = Math.abs(data[(((y + 1) * width + x) * 4)] - data[(((y - 1) * width + x) * 4)])
          const gradient = gradX + gradY
          
          // 根据梯度调整平滑强度
          const alpha = lambda / (1 + gradient)
          
          // 应用平滑
          for (let c = 0; c < 3; c++) {
            const sum = data[i + c] * (1 - 4 * alpha) +
                       data[((y * width + x + 1) * 4) + c] * alpha +
                       data[((y * width + x - 1) * 4) + c] * alpha +
                       data[(((y + 1) * width + x) * 4) + c] * alpha +
                       data[(((y - 1) * width + x) * 4) + c] * alpha
            
            output[i + c] = Math.max(0, Math.min(255, sum))
          }
        }
      }
      
      // 复制回原数组
      for (let i = 0; i < data.length; i++) {
        data[i] = output[i]
      }
    }
  }

  // 优化图片
  async optimizeImage(imageData, options = {}) {
    try {
      const { contrast = 1.1, brightness = 1.0, saturation = 1.0 } = options
      
      // 设置画布
      this.canvas.width = imageData.width
      this.canvas.height = imageData.height
      
      // 绘制原图
      this.ctx.clearRect(0, 0, imageData.width, imageData.height)
      this.ctx.drawImage(imageData, 0, 0, imageData.width, imageData.height)
      
      // 应用滤镜
      this.ctx.filter = `contrast(${contrast}) brightness(${brightness}) saturate(${saturation})`
      
      // 重新绘制
      this.ctx.drawImage(imageData, 0, 0, imageData.width, imageData.height)
      
      return {
        width: imageData.width,
        height: imageData.height,
        dataUrl: this.canvas.toDataURL('image/jpeg', 0.95)
      }
    } catch (error) {
      console.error('优化图片失败:', error)
      throw error
    }
  }

  // 保存图片到临时文件
  async saveImage(dataUrl) {
    try {
      // 将 dataURL 转换为临时文件路径
      const buffer = wx.base64ToArrayBuffer(dataUrl.split(',')[1])
      const tempFilePath = `${wx.env.USER_DATA_PATH}/processed_${Date.now()}.jpg`
      
      await wx.getFileSystemManager().writeFile({
        filePath: tempFilePath,
        data: buffer,
        encoding: 'base64'
      })
      
      return tempFilePath
    } catch (error) {
      console.error('保存图片失败:', error)
      throw error
    }
  }

  // 销毁资源
  destroy() {
    this.canvas = null
    this.ctx = null
    this.isInitialized = false
  }
}

// 导出单例实例
const imageProcessor = new ImageProcessor()

export default imageProcessor