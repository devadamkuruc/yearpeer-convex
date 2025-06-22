// Force dynamic rendering at the page level
export const dynamic = 'force-dynamic'

import {Heading} from "@/app/(marketing)/_components/heading";
import Heroes from "@/app/(marketing)/_components/heroes";
import Footer from "@/app/(marketing)/_components/footer";

const MarketingPage = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="h-full flex flex-col items-center justify-center xs:justify-start text-center gap-y-8 flex-1 px-6 pb-10">
                <Heading />
                <Heroes />
            </div>
            <Footer />
        </div>
    );
};

export default MarketingPage;