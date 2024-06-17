import { Avatar, List, message, Checkbox, Row, Col, Space, Button } from "antd";
import type { CheckboxProps } from "antd";
import VirtualList from "rc-virtual-list";
import { useEffect, useState } from "react";

import styles from "./CalculateListPage.module.less";
import { UploadOutlined } from "@ant-design/icons";
export default function CalculateListPage() {
  const [data, setData] = useState<UserItem[]>([]);
  interface UserItem {
    email: string;
    gender: string;
    name: {
      first: string;
      last: string;
      title: string;
    };
    nat: string;
    picture: {
      large: string;
      medium: string;
      thumbnail: string;
    };
  }
  const ContainerHeight = 600;
  const fakeDataUrl =
    "https://randomuser.me/api/?results=20&inc=name,gender,email,nat,picture&noinfo";
  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    // Refer to: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#problems_and_solutions
    if (
      Math.abs(
        e.currentTarget.scrollHeight -
          e.currentTarget.scrollTop -
          ContainerHeight
      ) <= 1
    ) {
      appendData();
    }
  };
  const appendData = () => {
    fetch(fakeDataUrl)
      .then((res) => res.json())
      .then((body) => {
        setData(data.concat(body.results));
        // message.success(`${body.results.length} more items loaded!`);
      });
  };

  useEffect(() => {
    appendData();
  }, []);

  const onChange: CheckboxProps["onChange"] = (e) => {
    console.log(`checked = ${e.target.checked}`);
  };

  return (
    <div className={styles.CalculateListPage}>
      <div
        style={{
          padding: "24px",
        }}
      >
        <Space>
          <Button type="primary" danger>删除选中的文件</Button>
          <Button type="primary">统一移动到指定目录</Button>
          <Button type="primary">导出</Button>
        </Space>
        <div style={{marginBottom: '12px'}}></div>
        <List>
          <VirtualList
            data={data}
            height={ContainerHeight}
            itemHeight={47}
            itemKey="email"
            onScroll={onScroll}
          >
            {(item: UserItem) => (
              <div
                style={{
                  marginBottom: "12px",
                }}
              >
                <div>
                  <Checkbox onChange={onChange}>
                    /Users/sysadmin/Downloads/Android-SDK@3.6.18.81676_20230117.zip
                  </Checkbox>
                </div>
                <div
                  style={{
                    backgroundColor: "var(--color-1)",
                    padding: "12px 3px",
                  }}
                >
                  <div>
                    <Checkbox onChange={onChange}>重复的文件路径1</Checkbox>
                  </div>
                  <div>
                    <Checkbox onChange={onChange}>重复的文件路径2</Checkbox>
                  </div>
                </div>
              </div>
              //   <List.Item key={item.email}>
              //     <List.Item.Meta
              //       avatar={
              //         <Checkbox onChange={onChange}></Checkbox>
              //       }
              //       title={ <div>文件路径</div>}
              //     //   description={item.email}
              //     />
              //     <div>Content</div>
              //   </List.Item>
            )}
          </VirtualList>
        </List>
      </div>
    </div>
  );
}
