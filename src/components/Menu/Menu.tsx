import styles from "./Menu.module.less";
// import type { ClassNameMap } from 'clsx';
import clsx from "clsx";

export default function Menu() {
  const menuConfig = [
    {
      label: "常用",
      child: [
        {
          label: "总类2",
        },
        {
          label: "总类3",
        },
      ],
    },
    {
      label: "总类",
      child: [
        {
          label: "总类4",
        },
        {
          label: "总类5",
        },
      ],
    },
  ];
  return (
    <div className={clsx(styles.box, styles.parent)}>
      <div className={styles.logoBox}>占位符</div>
      {menuConfig.map((item) => (
        <div className={styles.menuBox} key={item.label}>
          <div className={styles.label}>{item.label}</div>
          <div className={styles.menuChildBox}>
            {item?.child?.length > 0 &&
              item?.child.map((childItem) => (
                <div key={childItem.label}>{childItem.label}</div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
