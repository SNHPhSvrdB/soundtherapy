import { Container } from '@/components/container';
import { ScrollToTop } from './scroll-to-top';

import styles from './toolbar.module.css';

export function Toolbar() {
  return (
    <div className={styles.wrapper}>
      <Container className={styles.container} wide>
        <ScrollToTop />
      </Container>
    </div>
  );
}
