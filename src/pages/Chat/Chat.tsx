import {Input, Button, Spin} from "antd";
import {useEffect, useState} from "react";
import axios from "axios";
import Markdown from 'react-markdown'

export default function Chat() {
    const [inputText, setInputText] = useState('')
    const [assistantMsg, setAssistantMsg] = useState<any>({})
    const [messages, setMessages] = useState<any>([])

    const [loading, setLoading] = useState(false)
    const [spinTip, setSpinTip] = useState('')

    function InputChange(e: any) {
        console.log(15, e.target.value)
        setInputText(e.target.value)
    }

    async function getText() {
        setLoading(true)
        const _messages = [...messages]
        _messages.push(
            {
                "role": "user",
                "content": `${inputText}`
            }
        )
        const res = await axios.post('http://localhost:11434/api/chat', {
            // glm4 gemma2 llama3.1
                "model": "gemma2",
                "messages": _messages,
                "stream": false
            },
            {
                headers: {
                    // Overwrite Axios's automatically set Content-Type
                    'Content-Type': 'application/json'
                }
            })
        // const setMessages
        console.log(29, res.data);
        setAssistantMsg(res.data.message);
        _messages.push(res.data.message);
        console.log(43, _messages);
        setMessages(_messages)
        setLoading(false)
        /*if (res && res?.data) {
            const messageData = qs.parse(res.data)
            Object.keys(messageData).forEach(key => {
                console.log(24, qs.parse(key));
            })
        }*/
    }

    return <Spin spinning={loading} tip={spinTip}>
        <div style={{
            padding: '24px'
        }}>
            <h3>Chat</h3>
            <div>
                {/*value={inputText}*/}
                <Input onChange={InputChange} allowClear={true} showCount={true} ></Input>
                <div style={{
                    padding: '24px 0'
                }}>
                    {
                        messages.length > 0 && messages.map((item:any) => (
                            <div>
                                <div>user: {item.role}</div>
                                <div>
                                    <Markdown>{item.content}</Markdown>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <Button onClick={() => getText()}>获取</Button>
            </div>
        </div>
    </Spin>
}