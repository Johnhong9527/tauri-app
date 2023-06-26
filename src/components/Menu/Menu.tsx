import styles from "./Menu.module.less";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Menu() {
  let navigate = useNavigate();
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    initMenu();
  }, []);

  async function initMenu() {
    // const config = LogicalSize;
    // console.log({ LogicalSize: new LogicalSize() });
    // console.log(window);
    // setHeight(await window);
  }
  const menuConfig = [
    {
      label: "常用",
      child: [
        {
          label: "文件整理",
          path: "/file-sort",
        },
        {
          label: "文件清理",
          path: "/file-clear",
        },
        {
          label: "重复文件",
          path: "/duplicateFile",
        },
      ],
    },
    {
      label: "系统",
      child: [
        {
          label: "字符查询",
        },
        {
          label: "设置",
          path: "/setting",
        },
        {
          label: "关于我们",
          path: "/about",
        },
      ],
    },
  ];
  function menuHandle(path: string, label: string) {
    setActive(label);
    navigate(path);
  }
  return (
    <div className={clsx(styles.box, styles.parent)}>
      <div className={styles.logoBox}>占位符:</div>
      {menuConfig.map((item) => (
        <div className={styles.menuBox} key={item.label}>
          <div className={styles.label}>{item.label}</div>
          <div className={styles.menuChildBox}>
            {item?.child?.length > 0 &&
              item?.child.map((childItem) => (
                <div
                  key={childItem.label}
                  className={clsx(
                    styles.childItemLabel,
                    active === childItem.label && styles.active
                  )}
                  onClick={() =>
                    menuHandle(childItem.path || "", childItem.label)
                  }
                >
                  {childItem.label}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
