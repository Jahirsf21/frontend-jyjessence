import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
	const { t } = useTranslation();
	return (
		<footer className="w-full bg-gray-100 py-6 text-center text-gray-600 text-sm">
			<span>
				{t('footer.copyright', { defaultValue: '© 2025 JyJ Essence. Todos los derechos reservados.' })}
			</span>
		</footer>
	);
}
