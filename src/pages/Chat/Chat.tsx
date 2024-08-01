import {Input, Button, Spin, Select} from "antd";
import React, {useEffect, useRef, useState} from "react";
import Markdown from 'react-markdown'
import remarkGfm from "remark-gfm"

import {Prism as SyntaxHighlighter} from "react-syntax-highlighter"
import {oneDark as dark} from "react-syntax-highlighter/dist/esm/styles/prism"
import {CopyToClipboard} from 'react-copy-to-clipboard';


import {getChat, getTags} from '@/services/chat-service'
import styles from './Chat.module.less'
import {CopyOutlined} from "@ant-design/icons";

const {TextArea} = Input;
const {Option} = Select
export default function Chat() {

  const textAreaRef = useRef(null);
  const [inputText, setInputText] = useState('')
  const [assistantMsg, setAssistantMsg] = useState<any>({})
  const [messages, setMessages] = useState<any>([])

  const [loading, setLoading] = useState(false)
  const [spinTip, setSpinTip] = useState('')

  const [models, setModels] = useState([])
  const [useModels, setUseModels] = useState('')

  useEffect(() => {
    getLocalModels()
  }, [])

  function InputChange(e: any) {
    setInputText(e.target.value)
  }

  async function getLocalModels() {
    const res = await getTags()
    console.log(2424, res)
    const models = res.data.models.map((elm: any) => elm.model)
    console.log(31, models)
    setModels(models)
    setUseModels(models[0])
  }

  async function getText() {
    setLoading(true)
    const _messages = [...messages]
    const res = await getChat({
      "model": useModels,
      "messages": [
        ...messages,
        {
          "role": "user",
          "content": ` 翻译成中文,保留代码结构: ${inputText}`
        }
      ],
      "stream": false
    })
    _messages.push(
      {
        "role": "user",
        "content": `${inputText}`
      }
    )
    setAssistantMsg(res.data.message);
    _messages.push(res.data.message)
    setMessages(_messages)
    setInputText('')
    setLoading(false)
    /*if (res && res?.data) {
        const messageData = qs.parse(res.data)
        Object.keys(messageData).forEach(key => {
            console.log(24, qs.parse(key));
        })
    }*/
  }

  function clearText() {
    setInputText('')
    setMessages([])
  }

  function modelChange(e: any) {
    setUseModels(e)
  }

  return <Spin spinning={loading} tip={spinTip}>
    <div className={styles.ChatPage} style={{
      padding: '24px'
    }}>
      <div>
        <Select style={{
          width: '140px',
          marginRight: '12px'
        }}
                value={useModels}
                onChange={modelChange}>
          {models.map(model => <Option key={model}
                                       value={model}>{`${model}`.replace(/:latest/, '')}</Option>)}
        </Select>
        {useModels ? `${useModels}`.replace(/:latest/, '') : '选择模型:'}
      </div>
      <div>
        {/*value={inputText}*/}

        <div style={{
          padding: '24px 0'
        }}>
          {
            messages.length > 0 && messages.map((item: any, index: number) => (
              <div key={index} className={item.role === 'user' ? styles.userBox : styles.robotBox}>
                {item.role !== 'user' && <div className={styles.avatar}>{item.role}:</div>}
                <div className={styles.content}>
                  <Markdown
                    children={item.content}
                    components={{
                      code(props) {
                        const {children, className, node, ...rest} = props
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                          <div style={{position: 'relative', width: '94%'}}>
                            <CopyToClipboard text={String(children).replace(/\n$/, '')}>
                              {/*<Button

                                style={{
                                  position: 'absolute',
                                  top: '10px',
                                  right: '10px',
                                  backgroundColor: 'transparent',
                                  color: '#fff',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '5px 10px',
                                  borderRadius: '5px',
                                }}
                              >
                                <CopyOutlined/>
                              </Button>*/}
                              <CopyOutlined style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                backgroundColor: 'transparent',
                                color: '#fff',
                                border: 'none',
                                cursor: 'pointer',
                              }}/>
                            </CopyToClipboard>
                            {/*// @ts-ignore*/}
                            <SyntaxHighlighter
                              {...rest}
                              PreTag="div"
                              language={match[1]}
                              style={dark}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  />
                </div>
              </div>
            ))
          }
        </div>
        <TextArea value={inputText} ref={textAreaRef} onChange={InputChange} allowClear={true}
                  showCount={true}></TextArea>
        <Button onClick={() => getText()}>获取</Button>
        <Button onClick={() => clearText()}>清空</Button>
      </div>
    </div>
  </Spin>
}