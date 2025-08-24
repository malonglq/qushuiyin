// utils/linkParser.js
/**
 * 链接解析工具类
 * 负责解析各种平台的图片链接，支持小红书、抖音、公众号等
 */

class LinkParser {
  constructor() {
    this.platformPatterns = {
      xiaohongshu: {
        name: '小红书',
        patterns: [
          /xiaohongshu\.com\/explore\//,
          /xiaohongshu\.com\/discovery\/item\//,
          /xhslink\.com\//,
          /xiaohongshu\.com\/user\/profile\/\d+\/\w+/
        ],
        apiEndpoint: 'https://api.xiaohongshu.com/sns/v1/note/detail'
      },
      douyin: {
        name: '抖音',
        patterns: [
          /douyin\.com\/video\//,
          /douyin\.com\/share\/video\//,
          /iesdouyin\.com\/share\/video\//,
          /v\.douyin\.com\//
        ],
        apiEndpoint: 'https://www.douyin.com/aweme/v1/web/aweme/detail/'
      },
      weibo: {
        name: '微博',
        patterns: [
          /weibo\.com\/\d+\//,
          /m\.weibo\.cn\/detail\//,
          /weibo\.com\/status\//,
          /weibo\.com\/u\/\d+/
        ],
        apiEndpoint: 'https://api.weibo.com/2/statuses/show.json'
      },
      wechat: {
        name: '公众号',
        patterns: [
          /mp\.weixin\.qq\.com\/s\//,
          /mp\.weixin\.qq\.com\/mp\/appmsg\/show\//,
          /weixin\.qq\.com\/r\/\w+/
        ],
        apiEndpoint: 'https://api.weixin.qq.com/sns/jscode2session'
      },
      bilibili: {
        name: 'B站',
        patterns: [
          /bilibili\.com\/video\/BV\w+/,
          /b23\.tv\/\w+/,
          /bilibili\.com\/bangumi\/play\//
        ],
        apiEndpoint: 'https://api.bilibili.com/x/web-interface/view'
      }
    }
    
    this.imagePatterns = [
      /\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)?$/i,
      /^https?:\/\/.*\.(jpg|jpeg|png|gif|bmp|webp)/i,
      /^https?:\/\/(i\.pximg\.net|pbs\.twimg\.com|.*\.cdn\.com|.*\.alicdn\.com)/i
    ]
  }

  // 检测链接平台
  detectPlatform(url) {
    if (!url || typeof url !== 'string') return null
    
    for (const [key, platform] of Object.entries(this.platformPatterns)) {
      for (const pattern of platform.patterns) {
        if (pattern.test(url)) {
          return {
            id: key,
            name: platform.name,
            patterns: platform.patterns,
            apiEndpoint: platform.apiEndpoint
          }
        }
      }
    }
    
    return null
  }

  // 判断是否为图片链接
  isImageUrl(url) {
    if (!url || typeof url !== 'string') return false
    
    return this.imagePatterns.some(pattern => pattern.test(url))
  }

  // 解析链接
  async parseLink(url) {
    try {
      const platform = this.detectPlatform(url)
      
      if (!platform) {
        // 如果不是特定平台链接，检查是否为直接图片链接
        if (this.isImageUrl(url)) {
          return {
            type: 'direct_image',
            url: url,
            platform: null,
            images: [url]
          }
        } else {
          throw new Error('不支持的链接类型')
        }
      }
      
      // 根据平台解析
      switch (platform.id) {
        case 'xiaohongshu':
          return await this.parseXiaohongshu(url, platform)
        case 'douyin':
          return await this.parseDouyin(url, platform)
        case 'weibo':
          return await this.parseWeibo(url, platform)
        case 'wechat':
          return await this.parseWechat(url, platform)
        case 'bilibili':
          return await this.parseBilibili(url, platform)
        default:
          throw new Error(`暂不支持 ${platform.name} 平台`)
      }
    } catch (error) {
      console.error('解析链接失败:', error)
      throw error
    }
  }

  // 解析小红书链接
  async parseXiaohongshu(url, platform) {
    try {
      // 提取笔记ID
      const noteIdMatch = url.match(/explore\/([^\/?#]+)/) || url.match(/discovery\/item\/([^\/?#]+)/)
      const noteId = noteIdMatch ? noteIdMatch[1] : null
      
      if (!noteId) {
        throw new Error('无法获取小红书笔记ID')
      }
      
      // 模拟API调用（实际应该调用真实API）
      const mockResponse = {
        type: 'xiaohongshu',
        platform: platform,
        noteId: noteId,
        title: '小红书笔记',
        author: '用户昵称',
        images: [
          `https://temp.com/xiaohongshu_${noteId}_1.jpg`,
          `https://temp.com/xiaohongshu_${noteId}_2.jpg`,
          `https://temp.com/xiaohongshu_${noteId}_3.jpg`
        ],
        description: '这是一篇小红书笔记的描述',
        tags: ['生活', '美食', '旅行']
      }
      
      return mockResponse
    } catch (error) {
      console.error('解析小红书链接失败:', error)
      throw error
    }
  }

  // 解析抖音链接
  async parseDouyin(url, platform) {
    try {
      // 提取视频ID
      const videoIdMatch = url.match(/video\/(\d+)/) || url.match(/\/(\d{19})/)
      const videoId = videoIdMatch ? videoIdMatch[1] : null
      
      if (!videoId) {
        throw new Error('无法获取抖音视频ID')
      }
      
      // 模拟API调用
      const mockResponse = {
        type: 'douyin',
        platform: platform,
        videoId: videoId,
        title: '抖音视频',
        author: '抖音用户',
        images: [
          `https://temp.com/douyin_${videoId}_cover.jpg`,
          `https://temp.com/douyin_${videoId}_frame1.jpg`,
          `https://temp.com/douyin_${videoId}_frame2.jpg`
        ],
        description: '这是一个抖音视频',
        music: '背景音乐',
        tags: ['搞笑', '日常', '创意']
      }
      
      return mockResponse
    } catch (error) {
      console.error('解析抖音链接失败:', error)
      throw error
    }
  }

  // 解析微博链接
  async parseWeibo(url, platform) {
    try {
      // 提取微博ID
      const weiboIdMatch = url.match(/(\d+)/)
      const weiboId = weiboIdMatch ? weiboIdMatch[1] : null
      
      if (!weiboId) {
        throw new Error('无法获取微博ID')
      }
      
      // 模拟API调用
      const mockResponse = {
        type: 'weibo',
        platform: platform,
        weiboId: weiboId,
        title: '微博内容',
        author: '微博用户',
        images: [
          `https://temp.com/weibo_${weiboId}_1.jpg`,
          `https://temp.com/weibo_${weiboId}_2.jpg`
        ],
        description: '这是一条微博',
        reposts: 100,
        comments: 50,
        likes: 200
      }
      
      return mockResponse
    } catch (error) {
      console.error('解析微博链接失败:', error)
      throw error
    }
  }

  // 解析微信链接
  async parseWechat(url, platform) {
    try {
      // 提取文章ID
      const articleIdMatch = url.match(/s\/([^\/?#]+)/)
      const articleId = articleIdMatch ? articleIdMatch[1] : null
      
      if (!articleId) {
        throw new Error('无法获取微信文章ID')
      }
      
      // 模拟API调用
      const mockResponse = {
        type: 'wechat',
        platform: platform,
        articleId: articleId,
        title: '公众号文章',
        author: '公众号名称',
        images: [
          `https://temp.com/wechat_${articleId}_cover.jpg`,
          `https://temp.com/wechat_${articleId}_content1.jpg`,
          `https://temp.com/wechat_${articleId}_content2.jpg`
        ],
        description: '这是一篇公众号文章',
        publishTime: new Date().toISOString(),
        readCount: 1000
      }
      
      return mockResponse
    } catch (error) {
      console.error('解析微信链接失败:', error)
      throw error
    }
  }

  // 解析B站链接
  async parseBilibili(url, platform) {
    try {
      // 提取视频ID
      const bvidMatch = url.match\/video\/(BV\w+)/)
      const bvid = bvidMatch ? bvidMatch[1] : null
      
      if (!bvid) {
        throw new Error('无法获取B站视频ID')
      }
      
      // 模拟API调用
      const mockResponse = {
        type: 'bilibili',
        platform: platform,
        bvid: bvid,
        title: 'B站视频',
        author: 'UP主',
        images: [
          `https://temp.com/bilibili_${bvid}_cover.jpg`,
          `https://temp.com/bilibili_${bvid}_frame1.jpg`,
          `https://temp.com/bilibili_${bvid}_frame2.jpg`
        ],
        description: '这是一个B站视频',
        duration: '10:30',
        viewCount: 10000,
        danmakuCount: 500
      }
      
      return mockResponse
    } catch (error) {
      console.error('解析B站链接失败:', error)
      throw error
    }
  }

  // 批量下载图片
  async downloadImages(imageUrls, options = {}) {
    try {
      const { concurrency = 3, timeout = 30000 } = options
      const results = []
      const errors = []
      
      // 分组下载，控制并发数
      for (let i = 0; i < imageUrls.length; i += concurrency) {
        const batch = imageUrls.slice(i, i + concurrency)
        const batchPromises = batch.map((url, index) => 
          this.downloadSingleImage(url, timeout, i + index)
            .then(result => {
              results.push(result)
              return result
            })
            .catch(error => {
              errors.push({ url, error: error.message })
              return null
            })
        )
        
        await Promise.all(batchPromises)
      }
      
      return {
        success: results.filter(r => r !== null),
        failed: errors,
        total: imageUrls.length,
        successCount: results.length,
        failedCount: errors.length
      }
    } catch (error) {
      console.error('批量下载图片失败:', error)
      throw error
    }
  }

  // 下载单个图片
  async downloadSingleImage(url, timeout, index) {
    try {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('下载超时'))
        }, timeout)
        
        wx.downloadFile({
          url: url,
          success: (res) => {
            clearTimeout(timer)
            
            if (res.statusCode === 200) {
              resolve({
                url: url,
                tempFilePath: res.tempFilePath,
                index: index,
                size: res.header['Content-Length'] || 0,
                mimeType: res.header['Content-Type'] || 'image/jpeg'
              })
            } else {
              reject(new Error(`下载失败: ${res.statusCode}`))
            }
          },
          fail: (error) => {
            clearTimeout(timer)
            reject(new Error(`下载失败: ${error.errMsg}`))
          }
        })
      })
    } catch (error) {
      console.error('下载单个图片失败:', error)
      throw error
    }
  }

  // 获取支持的平台列表
  getSupportedPlatforms() {
    return Object.entries(this.platformPatterns).map(([key, platform]) => ({
      id: key,
      name: platform.name,
      description: this.getPlatformDescription(key)
    }))
  }

  // 获取平台描述
  getPlatformDescription(platformId) {
    const descriptions = {
      xiaohongshu: '支持小红书笔记图片提取',
      douyin: '支持抖音视频封面和帧图片提取',
      weibo: '支持微博图片内容提取',
      wechat: '支持公众号文章图片提取',
      bilibili: '支持B站视频封面提取'
    }
    
    return descriptions[platformId] || '支持该平台图片提取'
  }

  // 验证链接格式
  validateLink(url) {
    if (!url || typeof url !== 'string') {
      return {
        valid: false,
        error: '链接不能为空'
      }
    }
    
    // 检查URL格式
    try {
      new URL(url)
    } catch (error) {
      return {
        valid: false,
        error: '链接格式不正确'
      }
    }
    
    // 检查是否为支持的协议
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return {
        valid: false,
        error: '只支持http和https协议'
      }
    }
    
    // 检查平台支持
    const platform = this.detectPlatform(url)
    const isImage = this.isImageUrl(url)
    
    if (!platform && !isImage) {
      return {
        valid: false,
        error: '不支持的链接类型'
      }
    }
    
    return {
      valid: true,
      platform: platform,
      isDirectImage: isImage
    }
  }

  // 生成分享链接
  generateShareLink(result) {
    if (!result || !result.images || result.images.length === 0) {
      return null
    }
    
    const baseUrl = 'https://example.com/share'
    const params = new URLSearchParams({
      type: result.type,
      platform: result.platform?.id || 'direct',
      images: result.images.length,
      timestamp: Date.now()
    })
    
    return `${baseUrl}?${params.toString()}`
  }

  // 清理URL
  cleanUrl(url) {
    if (!url) return url
    
    // 移除UTM参数
    return url.replace(/([?&])utm_[^&]*&?/g, '$1')
              .replace(/([?&])gclid[^&]*&?/g, '$1')
              .replace(/[?&]$/, '')
  }
}

// 导出单例实例
const linkParser = new LinkParser()

export default linkParser