import { createRoot } from 'react-dom/client'
import './index.scss'
import {AppRoutes} from "./routes/constants.ts";
import {MainLayout} from "./layouts/MainLayout.tsx";
import {BrowserRouter} from "react-router-dom";


createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={AppRoutes.root}>
      <MainLayout/>
  </BrowserRouter>
)