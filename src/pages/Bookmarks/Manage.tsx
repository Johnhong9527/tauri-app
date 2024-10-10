import { useRoutes } from "react-router";
import { useNavigate } from "react-router-dom";
import styles from "./Manage.module.less";

export default function Manage() {
	let navigate = useNavigate();
	return (
		<div className={styles.ManagePage}  onClick={() => navigate(-1)}>Manage</div>
	)
}
