import React from 'react';
import { useTranslation } from 'react-i18next';

function Home() {
   const { t } = useTranslation();

	   return (
		   <div className="min-h-screen bg-gray-50">
			   <div className="py-12 px-4">
				   <div className="max-w-4xl mx-auto text-center">
					   <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						   {t('home.welcome')} <span className="text-blue-600">JyJ Essence</span>
					   </h1>
					   <p className="text-lg text-gray-600 mb-6">
						   {t('home.heroSubtitle')}
					   </p>
				   </div>
			   </div>
		   </div>
	   );
}

export default Home;
