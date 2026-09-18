import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import PrivacyConsent from "./components/PrivacyConsent";
import { ThemeProvider } from "./contexts/ThemeContext";
import Admin from "./pages/Admin";
import { AuthPage, PrivacyPage, ProfilePage, SupportPage } from "./pages/CentralPages";
import { AlertsPage, AppPage, DealsHome, ExtensionPage, OffersPage, PremiumPage, RankingPage, ShippingPage, WholesalePage } from "./pages/DealsPages";

function Router() {
  return <Switch>
    <Route path="/" component={DealsHome} />
    <Route path="/ofertas" component={OffersPage} />
    <Route path="/alertas" component={AlertsPage} />
    <Route path="/ranking" component={RankingPage} />
    <Route path="/premium" component={PremiumPage} />
    <Route path="/lotes" component={WholesalePage} />
    <Route path="/frete" component={ShippingPage} />
    <Route path="/extensao" component={ExtensionPage} />
    <Route path="/aplicativo" component={AppPage} />
    <Route path="/suporte" component={SupportPage} />
    <Route path="/perfil" component={ProfilePage} />
    <Route path="/politica-de-privacidade" component={PrivacyPage} />
    <Route path="/entrar"><AuthPage mode="login" /></Route>
    <Route path="/criar-conta"><AuthPage mode="register" /></Route>
    <Route path="/admin" component={Admin} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster theme="dark" /><Router /><PrivacyConsent /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
