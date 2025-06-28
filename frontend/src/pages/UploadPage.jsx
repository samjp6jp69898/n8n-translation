import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { WEBHOOK_UPLOAD_URL, FILE_URLS } from '../constants';

/**
 * 檔案上傳頁面組件
 * 提供 CSV 檔案上傳與下載分析結果的功能
 */
function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [htmlContent, setHtmlContent] = useState(null);
  const [stats, setStats] = useState({ total: 0, inconsistent: 0, consistent: 0 });
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  /**
   * 處理檔案選擇變更
   */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('請選擇 CSV 檔案');
    }
  };
  
  /**
   * 處理檔案拖放
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.add('border-primary');
      dropAreaRef.current.classList.add('bg-orange-50');
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('border-primary');
      dropAreaRef.current.classList.remove('bg-orange-50');
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('border-primary');
      dropAreaRef.current.classList.remove('bg-orange-50');
    }
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setError('');
      if (fileInputRef.current) {
        // 更新 file input 的值以保持一致性
        // 注意：由於安全限制，無法直接設置 input[type=file] 的值
      }
    } else {
      setFile(null);
      setError('請選擇 CSV 檔案');
    }
  }, []);

  /**
   * 處理表單提交
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('請先選擇檔案');
      return;
    }

    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 使用 n8n webhook URL
      const response = await axios.post(WEBHOOK_UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'json' // 改為 json 格式
      });

      // 解析回傳的 JSON 資料
      const responseData = response.data;
      
      setUploadSuccess(true);
      if (responseData && responseData.html) {
        setHtmlContent(responseData.html);
      }
      
      // 設置統計資料
      if (responseData && responseData.stats) {
        setStats(responseData.stats);
      }
    } catch (err) {
      console.error('上傳失敗:', err);
      setError('檔案上傳失敗，請稍後再試');
    } finally {
      setUploading(false);
    }
  };

  /**
   * 重設表單
   */
  const resetForm = () => {
    setFile(null);
    setUploadSuccess(false);
    setHtmlContent(null);
    setStats({ total: 0, inconsistent: 0, consistent: 0 });
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  /**
   * 移除已選擇的檔案
   */
  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  /**
   * 格式化檔案大小
   */
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col w-full px-4 py-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">翻譯檔案處理系統</h1>
        <p className="text-gray-600">上傳 CSV 檔案進行翻譯分析</p>
      </header>
      
      {/* 標籤頁切換 */}
      <div className="flex mb-6 max-w-lg mx-auto">
        <button 
          className={`flex-1 py-4 px-6 whitespace-nowrap ${activeTab === 'upload' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'} transition-all duration-300 rounded-l-lg border border-gray-200`}
          onClick={() => setActiveTab('upload')}
        >
          翻譯檔案處理
        </button>
        <button 
          className={`flex-1 py-4 px-6 ${activeTab === 'rules' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'} transition-all duration-300 rounded-r-lg border border-gray-200`}
          onClick={() => setActiveTab('rules')}
        >
          照規則修正
        </button>
      </div>

      <main className="flex flex-col items-center mx-auto my-6">
        {activeTab === 'upload' && !uploadSuccess && (
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept=".csv" 
                  ref={fileInputRef}
                  id="file-upload"
                  className="hidden"
                />
                <div 
                  ref={dropAreaRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-all hover:border-primary hover:bg-orange-50"
                >
                  <div className="text-4xl mb-3">📄</div>
                  <p className="text-gray-600">選擇 CSV 檔案或拖放至此</p>
                  <label htmlFor="file-upload" className="block mt-4 text-sm text-primary hover:underline cursor-pointer">
                    瀏覽檔案
                  </label>
                </div>
              </div>
              
              {file && (
                <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{file.name}</div>
                    <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                  </div>
                  <button 
                    type="button" 
                    onClick={removeFile}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {error && <p className="text-error mt-2 mb-4 text-sm bg-red-50 p-2 rounded border-l-2 border-error">{error}</p>}
              
              <button 
                type="submit" 
                className="w-full px-8 py-4 bg-primary text-white font-semibold rounded-lg transition-all hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5" 
                disabled={!file || uploading}
              >
                {uploading ? '處理中...' : '上傳並分析'}
              </button>
            </form>
          </div>
        )}
        {activeTab === 'upload' && uploadSuccess && (
          <div className="max-w-lg bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 mx-auto">
            {htmlContent ? (
              <>
                <div className="mb-6 text-left">
                  <div className="mb-4 flex items-center flex-col">
                    <h2 className="text-2xl font-semibold text-primary mb-2">分析結果</h2>
                    <div className="h-1 w-20 bg-primary rounded mb-4"></div>
                  </div>
                  
                  {/* 統計數據區塊 */}
                  <div className="flex gap-4 mb-6 whitespace-nowrap">
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary mb-1">{stats.total}</div>
                      <div className="text-sm text-gray-600">總翻譯條目</div>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-500 mb-1">{stats.inconsistent}</div>
                      <div className="text-sm text-gray-600">需要修正</div>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-500 mb-1">{stats.consistent}</div>
                      <div className="text-sm text-gray-600">已通過檢查</div>
                    </div>
                  </div>
                  
                  {/* 結果內容 */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="prose prose-primary max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 mt-6">
                  <button 
                    className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5" 
                    onClick={resetForm}
                  >
                    上傳新檔案
                  </button>
                </div>
              </>
            ) : (
              <p>載入中...</p>
            )}
          </div>
        )}
        {activeTab === 'rules' && (
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-md border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-primary mb-4">翻譯規則設定</h2>
            <p className="text-gray-600 mb-6">此功能正在開發中，敬請期待...</p>
          </div>
        )}
      </main>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p className="hover:text-primary transition-colors">&copy; {new Date().getFullYear()} 翻譯檔案處理系統</p>
      </footer>
    </div>
  );
}

export default UploadPage;
