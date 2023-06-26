import styles from "./DuplicateFile.module.less";
export default function DuplicateFile() {
  return (
    <div className={styles.DuplicateFileBox}>
      DuplicateFile DuplicateFile
      <div style={{ backgroundColor: "green", height: "200vh" }}>DuplicateFile</div>
    </div>
  );
}
