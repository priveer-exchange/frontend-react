import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom/client'
import {createHashRouter, createRoutesFromElements, Navigate, Route, RouterProvider} from "react-router-dom";
import {useChainId, WagmiProvider} from "wagmi";
import {config} from "wagmi.config";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

import './main.css'

import Layout from "./layout";
import Home from "./pages/Home/Home";
import Profile from "pages/Me/Profile";
import DealPage from "pages/Trade/Deal/Deal";
import UserDeals from "pages/Me/UserDeals";
import Offers from "pages/Trade/Offers/Offers";
import UserOffers from "pages/Me/Offers/UserOffers";
import OfferPage from "pages/Trade/Offer/Offer";
import OfferEdit from "pages/Trade/Offer/OfferEdit";
import OfferNew from "pages/Trade/Offer/OfferNew";


const router = createHashRouter( createRoutesFromElements(
    <Route element={<Layout />}>
        <Route index element={<Home/>} />
        <Route path={"/trade"}>
            <Route index element={<Navigate to={"/trade/sell"} />} />
            <Route path=":side/:token?/:fiat?/:method?" element={<Offers />}/>
            <Route path={"offer/:offerId"} element={<OfferPage />} />
            <Route path={"offer/new" } element={<OfferNew/>} />
            <Route path={"offer/edit/:offerId" } element={<OfferEdit/>} />
            <Route path={"deal/:dealId"} element={<DealPage />} />
        </Route>
        <Route path={"/profile/:profile"} element={<Profile />} />
        <Route path={"/me"}>
            <Route index element={<Profile />} />
            <Route path={"offers"} element={<UserOffers />}/>
            <Route path={"deals"} element={<UserDeals/>} />
        </Route>
    </Route>
));

const localStoragePersister = createSyncStoragePersister({
    storage: window.localStorage,
});

const getApolloClient = (chainId) => {
    const params = {
        uri: undefined,
        cache: new InMemoryCache()
    };

    if (chainId === 31337) {
        params.uri = 'http://localhost:8000/subgraphs/name/sov';
    }
    else {
        params.uri = import.meta.env.VITE_GRAPH_ENDPOINT.replace('CHAINID', `${chainId}`);
    }

    return new ApolloClient(params);
};

const App = () => {
    const chainId = useChainId();
    const [apolloClient, setApolloClient] = useState(() => getApolloClient(chainId));


    const [queryClient, setQueryClient] = useState(() => new QueryClient());

    useEffect(() => {
        const newQueryClient = new QueryClient();
        persistQueryClient({
            queryClient: newQueryClient,
            persister: localStoragePersister,
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
        });
        setQueryClient(newQueryClient);

        setApolloClient(getApolloClient(chainId));
    }, [chainId]);

    return (
        <QueryClientProvider client={queryClient}>
            <ApolloProvider client={apolloClient}>
                <RouterProvider router={router} />
            </ApolloProvider>
        </QueryClientProvider>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <WagmiProvider config={config}>
          <App />
      </WagmiProvider>
  </React.StrictMode>,
)
