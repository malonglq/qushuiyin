// utils/storageManager.js
/**
 * 存储管理工具类
 * 负责管理本地数据存储，包括历史记录、设置、缓存等
 */

class StorageManager {
  constructor() {
    this.storageKeys = {
      history: 'processHistory',
      settings: 'appSettings',
      userInfo: 'userInfo',
      cache: 'appCache',
      favorites: 'favoriteImages',
      statistics: 'appStatistics'
    }
    
    this.maxHistoryItems = 100
    this.maxCacheItems = 50
    this.cacheExpiration = 7 * 24 * 60 * 60 * 1000 // 7天
  }

  // 初始化存储
  async init() {
    try {
      // 初始化各个存储区域
      await this.initHistory()
      await this.initSettings()
      await this.initUserInfo()
      await this.initCache()
      await this.initStatistics()
      
      console.log('存储管理器初始化成功')
      return true
    } catch (error) {
      console.error('存储管理器初始化失败:', error)
      return false
    }
  }

  // 初始化历史记录
  async initHistory() {
    try {
      const history = wx.getStorageSync(this.storageKeys.history)
      if (!history) {
        wx.setStorageSync(this.storageKeys.history, [])
      }
    } catch (error) {
      console.error('初始化历史记录失败:', error)
    }
  }

  // 初始化设置
  async initSettings() {
    try {
      const settings = wx.getStorageSync(this.storageKeys.settings)
      if (!settings) {
        const defaultSettings = {
          processMode: 'auto',
          quality: 'high',
          intensity: 5,
          batchProcessing: true,
          autoSave: false,
          processNotification: true,
          updateNotification: true
        }
        wx.setStorageSync(this.storageKeys.settings, defaultSettings)
      }
    } catch (error) {
      console.error('初始化设置失败:', error)
    }
  }

  // 初始化用户信息
  async initUserInfo() {
    try {
      const userInfo = wx.getStorageSync(this.storageKeys.userInfo)
      if (!userInfo) {
        const defaultUserInfo = {
          nickname: '用户',
          avatar: '/images/default-avatar.png',
          membership: 'normal',
          registerTime: Date.now(),
          lastLoginTime: Date.now()
        }
        wx.setStorageSync(this.storageKeys.userInfo, defaultUserInfo)
      }
    } catch (error) {
      console.error('初始化用户信息失败:', error)
    }
  }

  // 初始化缓存
  async initCache() {
    try {
      const cache = wx.getStorageSync(this.storageKeys.cache)
      if (!cache) {
        wx.setStorageSync(this.storageKeys.cache, {})
      } else {
        // 清理过期缓存
        await this.cleanExpiredCache()
      }
    } catch (error) {
      console.error('初始化缓存失败:', error)
    }
  }

  // 初始化统计信息
  async initStatistics() {
    try {
      const statistics = wx.getStorageSync(this.storageKeys.statistics)
      if (!statistics) {
        const defaultStatistics = {
          totalProcessed: 0,
          totalSaved: 0,
          totalShared: 0,
          firstUseTime: Date.now(),
          lastUseTime: Date.now(),
          dailyUsage: {},
          platformUsage: {},
          qualityUsage: {}
        }
        wx.setStorageSync(this.storageKeys.statistics, defaultStatistics)
      }
    } catch (error) {
      console.error('初始化统计信息失败:', error)
    }
  }

  // 添加历史记录
  async addHistoryItem(item) {
    try {
      let history = wx.getStorageSync(this.storageKeys.history) || []
      
      // 添加时间戳
      const historyItem = {
        ...item,
        id: item.id || Date.now().toString(),
        timestamp: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      }
      
      // 添加到开头
      history.unshift(historyItem)
      
      // 限制数量
      if (history.length > this.maxHistoryItems) {
        history = history.slice(0, this.maxHistoryItems)
      }
      
      wx.setStorageSync(this.storageKeys.history, history)
      
      // 更新统计信息
      await this.updateStatistics('totalProcessed', 1)
      
      return historyItem
    } catch (error) {
      console.error('添加历史记录失败:', error)
      throw error
    }
  }

  // 获取历史记录
  async getHistory(options = {}) {
    try {
      const { 
        limit = 50, 
        offset = 0, 
        filter = {}, 
        sort = 'desc' 
      } = options
      
      let history = wx.getStorageSync(this.storageKeys.history) || []
      
      // 应用过滤
      if (filter.platform) {
        history = history.filter(item => item.platform === filter.platform)
      }
      
      if (filter.quality) {
        history = history.filter(item => item.quality === filter.quality)
      }
      
      if (filter.dateFrom) {
        history = history.filter(item => item.timestamp >= filter.dateFrom)
      }
      
      if (filter.dateTo) {
        history = history.filter(item => item.timestamp <= filter.dateTo)
      }
      
      // 排序
      if (sort === 'desc') {
        history.sort((a, b) => b.timestamp - a.timestamp)
      } else {
        history.sort((a, b) => a.timestamp - b.timestamp)
      }
      
      // 分页
      const total = history.length
      const items = history.slice(offset, offset + limit)
      
      return {
        items: items,
        total: total,
        offset: offset,
        limit: limit,
        hasMore: offset + limit < total
      }
    } catch (error) {
      console.error('获取历史记录失败:', error)
      throw error
    }
  }

  // 删除历史记录
  async deleteHistoryItem(id) {
    try {
      let history = wx.getStorageSync(this.storageKeys.history) || []
      const itemIndex = history.findIndex(item => item.id === id)
      
      if (itemIndex !== -1) {
        const deletedItem = history[itemIndex]
        history.splice(itemIndex, 1)
        
        wx.setStorageSync(this.storageKeys.history, history)
        
        // 更新统计信息
        await this.updateStatistics('totalProcessed', -1)
        
        return deletedItem
      }
      
      return null
    } catch (error) {
      console.error('删除历史记录失败:', error)
      throw error
    }
  }

  // 清空历史记录
  async clearHistory() {
    try {
      wx.setStorageSync(this.storageKeys.history, [])
      
      // 重置相关统计
      await this.updateStatistics('totalProcessed', 0)
      
      return true
    } catch (error) {
      console.error('清空历史记录失败:', error)
      throw error
    }
  }

  // 更新历史记录
  async updateHistoryItem(id, updates) {
    try {
      let history = wx.getStorageSync(this.storageKeys.history) || []
      const itemIndex = history.findIndex(item => item.id === id)
      
      if (itemIndex !== -1) {
        history[itemIndex] = {
          ...history[itemIndex],
          ...updates,
          updatedAt: Date.now()
        }
        
        wx.setStorageSync(this.storageKeys.history, history)
        
        return history[itemIndex]
      }
      
      return null
    } catch (error) {
      console.error('更新历史记录失败:', error)
      throw error
    }
  }

  // 获取设置
  async getSettings() {
    try {
      return wx.getStorageSync(this.storageKeys.settings) || {}
    } catch (error) {
      console.error('获取设置失败:', error)
      return {}
    }
  }

  // 更新设置
  async updateSettings(settings) {
    try {
      const currentSettings = wx.getStorageSync(this.storageKeys.settings) || {}
      const newSettings = {
        ...currentSettings,
        ...settings,
        updatedAt: Date.now()
      }
      
      wx.setStorageSync(this.storageKeys.settings, newSettings)
      
      return newSettings
    } catch (error) {
      console.error('更新设置失败:', error)
      throw error
    }
  }

  // 获取用户信息
  async getUserInfo() {
    try {
      return wx.getStorageSync(this.storageKeys.userInfo) || {}
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return {}
    }
  }

  // 更新用户信息
  async updateUserInfo(userInfo) {
    try {
      const currentUserInfo = wx.getStorageSync(this.storageKeys.userInfo) || {}
      const newUserInfo = {
        ...currentUserInfo,
        ...userInfo,
        updatedAt: Date.now()
      }
      
      wx.setStorageSync(this.storageKeys.userInfo, newUserInfo)
      
      return newUserInfo
    } catch (error) {
      console.error('更新用户信息失败:', error)
      throw error
    }
  }

  // 添加缓存
  async addCache(key, data, expiration = this.cacheExpiration) {
    try {
      let cache = wx.getStorageSync(this.storageKeys.cache) || {}
      
      cache[key] = {
        data: data,
        timestamp: Date.now(),
        expiration: expiration
      }
      
      wx.setStorageSync(this.storageKeys.cache, cache)
      
      return true
    } catch (error) {
      console.error('添加缓存失败:', error)
      return false
    }
  }

  // 获取缓存
  async getCache(key) {
    try {
      const cache = wx.getStorageSync(this.storageKeys.cache) || {}
      const cacheItem = cache[key]
      
      if (!cacheItem) {
        return null
      }
      
      // 检查是否过期
      if (Date.now() - cacheItem.timestamp > cacheItem.expiration) {
        delete cache[key]
        wx.setStorageSync(this.storageKeys.cache, cache)
        return null
      }
      
      return cacheItem.data
    } catch (error) {
      console.error('获取缓存失败:', error)
      return null
    }
  }

  // 删除缓存
  async deleteCache(key) {
    try {
      const cache = wx.getStorageSync(this.storageKeys.cache) || {}
      
      if (cache[key]) {
        delete cache[key]
        wx.setStorageSync(this.storageKeys.cache, cache)
        return true
      }
      
      return false
    } catch (error) {
      console.error('删除缓存失败:', error)
      return false
    }
  }

  // 清理过期缓存
  async cleanExpiredCache() {
    try {
      const cache = wx.getStorageSync(this.storageKeys.cache) || {}
      const now = Date.now()
      let cleanedCount = 0
      
      for (const key in cache) {
        if (now - cache[key].timestamp > cache[key].expiration) {
          delete cache[key]
          cleanedCount++
        }
      }
      
      if (cleanedCount > 0) {
        wx.setStorageSync(this.storageKeys.cache, cache)
      }
      
      return cleanedCount
    } catch (error) {
      console.error('清理过期缓存失败:', error)
      return 0
    }
  }

  // 清空所有缓存
  async clearCache() {
    try {
      wx.setStorageSync(this.storageKeys.cache, {})
      return true
    } catch (error) {
      console.error('清空缓存失败:', error)
      return false
    }
  }

  // 更新统计信息
  async updateStatistics(key, value) {
    try {
      const statistics = wx.getStorageSync(this.storageKeys.statistics) || {}
      
      // 更新基本统计
      if (typeof statistics[key] === 'number') {
        statistics[key] = Math.max(0, statistics[key] + value)
      }
      
      // 更新使用时间
      statistics.lastUseTime = Date.now()
      
      // 更新每日使用统计
      const today = new Date().toDateString()
      if (!statistics.dailyUsage[today]) {
        statistics.dailyUsage[today] = 0
      }
      statistics.dailyUsage[today] += Math.abs(value)
      
      wx.setStorageSync(this.storageKeys.statistics, statistics)
      
      return statistics
    } catch (error) {
      console.error('更新统计信息失败:', error)
      throw error
    }
  }

  // 获取统计信息
  async getStatistics() {
    try {
      return wx.getStorageSync(this.storageKeys.statistics) || {}
    } catch (error) {
      console.error('获取统计信息失败:', error)
      return {}
    }
  }

  // 获取存储使用情况
  async getStorageInfo() {
    try {
      const info = wx.getStorageInfoSync()
      
      return {
        currentSize: info.currentSize,
        limitSize: info.limitSize,
        keys: info.keys,
        usagePercentage: (info.currentSize / info.limitSize) * 100
      }
    } catch (error) {
      console.error('获取存储信息失败:', error)
      return null
    }
  }

  // 备份数据
  async backupData() {
    try {
      const backup = {
        timestamp: Date.now(),
        version: '1.0.0',
        data: {
          history: wx.getStorageSync(this.storageKeys.history) || [],
          settings: wx.getStorageSync(this.storageKeys.settings) || {},
          userInfo: wx.getStorageSync(this.storageKeys.userInfo) || {},
          statistics: wx.getStorageSync(this.storageKeys.statistics) || {}
        }
      }
      
      return backup
    } catch (error) {
      console.error('备份数据失败:', error)
      throw error
    }
  }

  // 恢复数据
  async restoreData(backup) {
    try {
      if (!backup || !backup.data) {
        throw new Error('备份数据格式不正确')
      }
      
      const { history, settings, userInfo, statistics } = backup.data
      
      if (history) {
        wx.setStorageSync(this.storageKeys.history, history)
      }
      
      if (settings) {
        wx.setStorageSync(this.storageKeys.settings, settings)
      }
      
      if (userInfo) {
        wx.setStorageSync(this.storageKeys.userInfo, userInfo)
      }
      
      if (statistics) {
        wx.setStorageSync(this.storageKeys.statistics, statistics)
      }
      
      return true
    } catch (error) {
      console.error('恢复数据失败:', error)
      throw error
    }
  }

  // 导出数据
  async exportData() {
    try {
      const data = {
        history: await this.getHistory(),
        settings: await this.getSettings(),
        userInfo: await this.getUserInfo(),
        statistics: await this.getStatistics(),
        exportTime: Date.now()
      }
      
      return data
    } catch (error) {
      console.error('导出数据失败:', error)
      throw error
    }
  }

  // 销毁存储管理器
  async destroy() {
    try {
      // 清理过期缓存
      await this.cleanExpiredCache()
      
      console.log('存储管理器已销毁')
    } catch (error) {
      console.error('销毁存储管理器失败:', error)
    }
  }
}

// 导出单例实例
const storageManager = new StorageManager()

export default storageManager