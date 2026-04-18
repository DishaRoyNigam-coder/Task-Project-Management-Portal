import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router';
import { Divider, IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import { useAuth } from 'context/AuthContext';
import { useSettingsContext } from 'providers/SettingsProvider';
import employeeSitemap from 'routes/employeeSitemap';
import sitemap from 'routes/sitemap';
import IconifyIcon from 'components/base/IconifyIcon';
import Logo from 'components/common/Logo';
import PromoCard from 'components/common/PromoCard';
import NavItem from './NavItem';
import SidenavSimpleBar from './SidenavSimpleBar';
import promo from '/assets/images/illustrations/5.webp';

interface SidenavDrawerContentProps {
  variant?: 'permanent' | 'temporary';
}

const SidenavDrawerContent = ({ variant = 'permanent' }: SidenavDrawerContentProps) => {
  const {
    config: { sidenavCollapsed, openNavbarDrawer },
    setConfig,
  } = useSettingsContext();
  const { user } = useAuth();
  const { pathname } = useLocation();

  // Choose sitemap based on user role, with path fallback
  const currentSitemap = useMemo(() => {
    if (user?.role === 'employee') return employeeSitemap;
    if (pathname.startsWith('/employee')) return employeeSitemap; // fallback
    return sitemap;
  }, [user, pathname]);

  const expanded = useMemo(
    () => variant === 'temporary' || (variant === 'permanent' && !sidenavCollapsed),
    [sidenavCollapsed, variant],
  );

  const toggleNavbarDrawer = () => {
    setConfig({
      openNavbarDrawer: !openNavbarDrawer,
    });
  };

  // Optional: remove after verifying correct behavior
  useEffect(() => {
    console.log('User role:', user?.role);
    console.log('Using sitemap:', currentSitemap === employeeSitemap ? 'employee' : 'admin');
  }, [user, currentSitemap]);

  return (
    <>
      <Toolbar variant="appbar" sx={{ display: 'block', px: { xs: 0 } }}>
        <Box
          sx={[
            {
              height: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            !expanded && {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            },
            expanded && {
              pl: { xs: 4, md: 6 },
              pr: { xs: 2, md: 3 },
            },
          ]}
        >
          <Logo />
          <IconButton sx={{ mt: 1, display: { md: 'none' } }} onClick={toggleNavbarDrawer}>
            <IconifyIcon icon="material-symbols:left-panel-close-outline" fontSize={20} />
          </IconButton>
        </Box>
      </Toolbar>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <SidenavSimpleBar>
          <Box
            sx={[
              {
                py: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              },
              !expanded && {
                px: 2,
              },
              expanded && {
                px: { xs: 2, md: 4 },
              },
            ]}
          >
            <div>
              {currentSitemap.map((menu) => (
                <Box key={menu.id}>
                  {menu.subheader === 'Docs' && !sidenavCollapsed && <Divider sx={{ mb: 4 }} />}
                  <List
                    dense
                    key={menu.id}
                    sx={{
                      mb: 0.25,
                      pb: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    {menu.items.map((item) => (
                      <NavItem key={item.pathName} item={item} level={0} />
                    ))}
                  </List>
                </Box>
              ))}
            </div>
            {!sidenavCollapsed && <PromoCard img={promo} imgStyles={{ maxWidth: 136 }} />}
          </Box>
        </SidenavSimpleBar>
      </Box>
    </>
  );
};

export default SidenavDrawerContent;
