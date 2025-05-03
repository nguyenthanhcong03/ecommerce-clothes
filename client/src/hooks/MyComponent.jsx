import { Button } from 'antd';
import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    background-color: ${token.colorPrimary};
    color: white;
    padding: 10px 50px;
    border-radius: 0px;
  `
}));

export default function Demo() {
  const { styles } = useStyles();

  return <Button className={styles.button}>Click Me</Button>;
}
