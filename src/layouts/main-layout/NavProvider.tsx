import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useLocation } from 'react-router';
import { useAuth } from 'context/AuthContext';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import { COLLAPSE_NAVBAR, EXPAND_NAVBAR } from 'reducers/SettingsReducer';
import employeeSitemap from 'routes/employeeSitemap';
import { MenuItem, SubMenuItem } from 'routes/sitemap';
import sitemap from 'routes/sitemap';

interface NavContextInterface {
  openItems: string[];
  setOpenItems: Dispatch<SetStateAction<string[]>>;
  isNestedItemOpen: (items?: SubMenuItem[]) => boolean;
}

const NavContext = createContext({} as NavContextInterface);

// Helper to find which parent item (by pathName) should be open for a given path
const findOpenItemForPath = (pathname: string, sitemapItems: MenuItem[]): string[] => {
  const result: string[] = [];
  for (const menu of sitemapItems) {
    for (const item of menu.items) {
      const isDescendantActive = (subItem: SubMenuItem): boolean => {
        if (subItem.path && pathname === subItem.path) return true;
        if (subItem.selectionPrefix && pathname.includes(subItem.selectionPrefix)) return true;
        if (subItem.items) return subItem.items.some(isDescendantActive);
        return false;
      };
      if (isDescendantActive(item)) {
        result.push(item.pathName);
        break;
      }
    }
  }
  return result;
};

const NavProvider = ({ children }: PropsWithChildren) => {
  const { pathname } = useLocation();
  const { user } = useAuth(); // ← get logged‑in user
  const { currentBreakpoint, down } = useBreakpoints();
  const downMd = down('md');
  const {
    config: { sidenavCollapsed },
    setConfig,
    configDispatch,
  } = useSettingsContext();

  const [openItems, setOpenItems] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [responsiveSidenavCollapsed, setResponsiveSidenavCollapsed] = useState(false);

  // Choose sitemap based on user role (admin or employee)
  const currentSitemap = user?.role === 'employee' ? employeeSitemap : sitemap;

  // Auto‑expand parent items when route changes
  useEffect(() => {
    const toOpen = findOpenItemForPath(pathname, currentSitemap);
    if (toOpen.length > 0) {
      setOpenItems(toOpen);
    }
  }, [pathname, currentSitemap]);

  const isNestedItemOpen = (items: SubMenuItem[] = []) => {
    const checkLink = (children: SubMenuItem) => {
      if (
        `${children.path}` === pathname ||
        (children.selectionPrefix && pathname!.includes(children.selectionPrefix))
      ) {
        return true;
      }
      return children.items && children.items.some(checkLink);
    };
    return items.some(checkLink);
  };

  // Sidebar collapse/expand logic (responsive behaviour)
  useEffect(() => {
    if (sidenavCollapsed) {
      configDispatch({ type: COLLAPSE_NAVBAR });
    }
    if (currentBreakpoint === 'md') {
      configDispatch({ type: COLLAPSE_NAVBAR });
      setResponsiveSidenavCollapsed(true);
    }
    if (downMd) {
      configDispatch({ type: EXPAND_NAVBAR });
    }
    if (currentBreakpoint === 'md') {
      setConfig({ openNavbarDrawer: false });
    }
    if (!loaded) setLoaded(true);
  }, [currentBreakpoint, downMd]);

  useEffect(() => {
    if (currentBreakpoint !== 'md' && responsiveSidenavCollapsed) {
      setResponsiveSidenavCollapsed(false);
      configDispatch({ type: EXPAND_NAVBAR });
    }
  }, [currentBreakpoint]);

  return (
    <NavContext.Provider value={{ openItems, setOpenItems, isNestedItemOpen }}>
      {loaded && children}
    </NavContext.Provider>
  );
};

export const useNavContext = () => useContext(NavContext);
export default NavProvider;
