import { Router } from 'express';

const router = Router();

router.use('/', (req, res) => {
  res.send('ok');
});

export const apiRoutes = router;
