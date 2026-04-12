import { useMemo, useState } from 'react'
import { Alert, App, Button, Card, ConfigProvider, Flex, Image, Input, Space, Tabs, Typography, Upload, theme } from 'antd'
import { CopyOutlined, DeleteOutlined, DownloadOutlined, FileTextOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'

const { TextArea } = Input
const { Text, Title } = Typography

type Mode = 'text' | 'image'

function encodeUtf8(str: string) {
  return btoa(unescape(encodeURIComponent(str)))
}

function decodeUtf8(str: string) {
  return decodeURIComponent(escape(atob(str)))
}

function normalizeImageDataUrl(value: string) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(raw)) return raw
  return `data:image/png;base64,${raw.replace(/^base64,?/i, '').replace(/\s+/g, '')}`
}

export default function Base64Tool() {
  const { message } = App.useApp()
  const { token } = theme.useToken()

  const [mode, setMode] = useState<Mode>('text')
  const [textInput, setTextInput] = useState('')
  const [textOutput, setTextOutput] = useState('')

  const [imageFile, setImageFile] = useState<UploadFile | null>(null)
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [imageInput, setImageInput] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      setImageFile({ uid: file.uid, name: file.name, size: file.size, type: file.type, originFileObj: file, status: 'done' })
      setImageDataUrl(result)
      message.success('图片已转换为 Base64')
    }
    reader.onerror = () => message.error('图片读取失败，请重试')
    reader.readAsDataURL(file)
    return false
  }

  const imageMeta = useMemo(() => {
    if (!imageFile) return ''
    const size = imageFile.size || 0
    const sizeText = size >= 1024 * 1024 ? `${(size / (1024 * 1024)).toFixed(2)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`
    return `${imageFile.name} · ${sizeText}`
  }, [imageFile])

  const handleCopy = async (value: string, successText: string) => {
    if (!value) {
      message.warning('当前没有可复制的内容')
      return
    }
    try {
      await navigator.clipboard.writeText(value)
      message.success(successText)
    } catch {
      message.error('复制失败，请手动复制')
    }
  }

  const handleTextEncode = () => {
    try {
      setTextOutput(encodeUtf8(textInput))
      message.success('文本已编码为 Base64')
    } catch {
      message.error('编码失败，请检查输入内容')
    }
  }

  const handleTextDecode = () => {
    try {
      setTextOutput(decodeUtf8(textInput))
      message.success('Base64 已解码为文本')
    } catch {
      message.error('解码失败，输入内容不是合法的 Base64')
    }
  }

  const handleImagePreview = () => {
    try {
      const dataUrl = normalizeImageDataUrl(imageInput)
      if (!dataUrl) {
        setImagePreview('')
        message.warning('请先输入图片 Base64')
        return
      }
      setImagePreview(dataUrl)
      message.success('图片预览已生成')
    } catch {
      setImagePreview('')
      message.error('图片解析失败，请确认 Base64 是否正确')
    }
  }

  const uploadButton = (
    <Button type="primary" icon={<UploadOutlined />} size="middle" style={{ borderRadius: 12, boxShadow: 'none' }}>
      选择图片
    </Button>
  )

  const cardStyle = {
    borderRadius: 22,
    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)',
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(8px)',
  } as const

  const previewShellStyle = {
    minHeight: 280,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.66)',
    borderRadius: 18,
    overflow: 'hidden',
    padding: 14,
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.45)',
  } as const

  const inputStyle = {
    borderRadius: 16,
    background: 'rgba(255,255,255,0.88)',
  } as const

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 18,
  } as const

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2d8cff',
          borderRadius: 16,
          colorBgContainer: 'rgba(255,255,255,0.84)',
          boxShadowSecondary: '0 12px 32px rgba(15, 23, 42, 0.06)',
        },
        components: {
          Button: { borderRadius: 12, boxShadow: 'none' },
          Input: { activeShadow: '0 0 0 4px rgba(45, 140, 255, 0.12)' },
          Tabs: { inkBarColor: '#2d8cff', itemActiveColor: '#2d8cff', itemSelectedColor: '#2d8cff' },
        },
      }}
    >
      <div>
        <Flex justify="space-between" align="center" gap={12} wrap="wrap" style={{ marginBottom: 18 }}>
          <div
            style={{
              display: 'inline-flex',
              gap: 6,
              padding: 4,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.72)',
              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
            }}
          >
            {[
              { label: '文本', value: 'text', icon: <FileTextOutlined /> },
              { label: '图片', value: 'image', icon: <PictureOutlined /> },
            ].map((item) => {
              const active = mode === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMode(item.value as Mode)}
                  style={{
                    border: 0,
                    outline: 'none',
                    minHeight: 40,
                    padding: '0 16px',
                    borderRadius: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 700,
                    background: active ? 'linear-gradient(135deg, #1677ff, #57a8ff)' : 'transparent',
                    color: active ? '#fff' : '#51606f',
                    boxShadow: active ? '0 10px 24px rgba(22, 119, 255, 0.22)' : 'none',
                    cursor: 'pointer',
                    transition: 'all .18s ease',
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
          <Text type="secondary">{mode === 'text' ? '文本与 Base64 互转' : '图片与 Base64 互转'}</Text>
        </Flex>

        {mode === 'text' ? (
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            <Card bordered={false} style={cardStyle} bodyStyle={{ padding: 24 }}>
              <Space direction="vertical" size={14} style={{ width: '100%' }}>
                <Text strong>输入内容</Text>
                <TextArea rows={8} value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="请输入要编码或解码的文本内容" style={inputStyle} />
                <Flex gap={10} wrap="wrap">
                  <Button type="primary" onClick={handleTextEncode}>文本转 Base64</Button>
                  <Button onClick={handleTextDecode}>Base64 转文本</Button>
                  <Button icon={<DeleteOutlined />} onClick={() => { setTextInput(''); setTextOutput('') }}>清空文本区</Button>
                  <Button icon={<CopyOutlined />} onClick={() => handleCopy(textOutput, '结果已复制到剪贴板')}>复制结果</Button>
                </Flex>
              </Space>
            </Card>

            <Card bordered={false} style={cardStyle} bodyStyle={{ padding: 24 }}>
              <Space direction="vertical" size={14} style={{ width: '100%' }}>
                <Text strong>输出结果</Text>
                <TextArea rows={8} value={textOutput} onChange={(e) => setTextOutput(e.target.value)} placeholder="结果会显示在这里" style={inputStyle} />
              </Space>
            </Card>
          </Space>
        ) : (
          <Tabs
          defaultActiveKey="image-to-base64"
          style={{ marginTop: 4 }}
          items={[
            {
              key: 'image-to-base64',
              label: '图片转 Base64',
              children: (
                <Space direction="vertical" size={18} style={{ width: '100%' }}>
                  <Card bordered={false} style={cardStyle} bodyStyle={{ padding: 24 }}>
                    <Flex align="center" justify="space-between" wrap="wrap" gap={12}>
                      <Space direction="vertical" size={2}>
                        <Text strong>上传图片</Text>
                        <Text type="secondary">选择图片后自动生成 Base64，下面同步显示原图预览。</Text>
                      </Space>
                      <Space wrap>
                        <Upload accept="image/*" showUploadList={false} beforeUpload={beforeUpload} maxCount={1}>
                          {uploadButton}
                        </Upload>
                        <Button icon={<CopyOutlined />} onClick={() => handleCopy(imageDataUrl, '图片 Base64 已复制到剪贴板')}>复制图片 Base64</Button>
                        <Button icon={<DeleteOutlined />} onClick={() => { setImageFile(null); setImageDataUrl('') }}>清空</Button>
                      </Space>
                    </Flex>
                    {imageMeta ? <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>{imageMeta}</Text> : null}
                  </Card>

                  <div style={gridStyle}>
                    <Card bordered={false} style={{ ...cardStyle, minHeight: 360 }} bodyStyle={{ padding: 24, height: '100%' }}>
                      <Space direction="vertical" size={14} style={{ width: '100%' }}>
                        <Text strong>原图预览</Text>
                        <div style={previewShellStyle}>
                          {imageDataUrl ? <Image src={imageDataUrl} alt="上传图片预览" style={{ maxHeight: 256, objectFit: 'contain' }} /> : <Text type="secondary">选择图片后会在这里显示原图预览</Text>}
                        </div>
                      </Space>
                    </Card>

                    <Card bordered={false} style={{ ...cardStyle, minHeight: 360 }} bodyStyle={{ padding: 24, height: '100%' }}>
                      <Space direction="vertical" size={14} style={{ width: '100%' }}>
                        <Text strong>图片 Base64 结果</Text>
                        <TextArea rows={11} value={imageDataUrl} onChange={(e) => setImageDataUrl(e.target.value)} placeholder="选择图片后会自动生成 Data URL / Base64" style={inputStyle} />
                      </Space>
                    </Card>
                  </div>
                </Space>
              ),
            },
            {
              key: 'base64-to-image',
              label: 'Base64 转图片',
              children: (
                <div style={gridStyle}>
                  <Card bordered={false} style={{ ...cardStyle, minHeight: 360 }} bodyStyle={{ padding: 24, height: '100%' }}>
                    <Space direction="vertical" size={14} style={{ width: '100%' }}>
                      <Text strong>输入 Base64</Text>
                      <TextArea rows={11} value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="请输入图片的 Base64 或 Data URL，例如 data:image/png;base64,..." style={inputStyle} />
                      <Flex gap={10} wrap="wrap">
                        <Button type="primary" onClick={handleImagePreview}>生成图片预览</Button>
                        <Button icon={<DeleteOutlined />} onClick={() => { setImageInput(''); setImagePreview('') }}>清空预览区</Button>
                      </Flex>
                    </Space>
                  </Card>

                  <Card bordered={false} style={{ ...cardStyle, minHeight: 360 }} bodyStyle={{ padding: 24, height: '100%' }}>
                    <Space direction="vertical" size={14} style={{ width: '100%' }}>
                      <Text strong>图片预览</Text>
                      <div style={previewShellStyle}>
                        {imagePreview ? <Image src={imagePreview} alt="Base64 图片预览" style={{ maxHeight: 256, objectFit: 'contain' }} /> : <Alert type="info" showIcon message="输入图片 Base64 后可在这里预览" style={{ width: '100%' }} />}
                      </div>
                      <Button icon={<DownloadOutlined />} href={imagePreview || undefined} download="base64-image.png" disabled={!imagePreview}>下载图片</Button>
                    </Space>
                  </Card>
                </div>
              ),
            },
          ]}
          />
        )}
      </div>
    </ConfigProvider>
  )
}
