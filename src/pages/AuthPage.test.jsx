import {render,screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {expect,test,vi} from 'vitest';
import AuthPage from './AuthPage';
vi.mock('../context/AuthContext',()=>({useAuth:()=>({register:vi.fn(),login:vi.fn()})}));
vi.mock('../services/api',()=>({api:vi.fn()}));
test('registration requires separate terms and privacy consent',()=>{render(<MemoryRouter><AuthPage mode="register"/></MemoryRouter>);expect(screen.getByRole('checkbox',{name:/terms of use/i})).toBeRequired();expect(screen.getByRole('checkbox',{name:/privacy policy/i})).toBeRequired();expect(screen.getByRole('button',{name:/create account/i})).toBeInTheDocument()});
