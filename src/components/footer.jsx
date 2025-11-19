import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
	const { t } = useTranslation();
	
	return (
		<footer className="w-full bg-gray-900 dark:bg-gray-950 text-white dark:text-gray-100 transition-colors duration-200">
			<div className="max-w-7xl mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					
					{/* Logo y descripción */}
					<div className="flex flex-col items-start">
						<img 
							src="https://res.cloudinary.com/drec8g03e/image/upload/v1762655746/jyjessence_y75wqc.webp" 
							alt="JyJ Essence Logo" 
							className="w-20 h-20 mb-4 rounded-lg"
						/>
						<h3 className="text-xl font-bold mb-2">JyJ Essence</h3>
					<p className="text-gray-300 dark:text-gray-400 text-sm text-left transition-colors duration-200">
						{t('footer.description', { defaultValue: 'Tu tienda especializada en fragancias de alta calidad' })}
					</p>
					</div>

					{/* Horario de atención */}
					<div className="flex flex-col items-start">
						<h4 className="text-lg font-semibold mb-4">{t('footer.hours', { defaultValue: 'Horario de Atención' })}</h4>
						<div className="text-gray-300 dark:text-gray-400 text-sm space-y-1 text-left transition-colors duration-200">
							<p>{t('footer.hours.week', { defaultValue: 'Lunes a Domingo' })}</p>
							<p className="font-medium">7:00 AM - 12:00 PM</p>
						</div>
					</div>

					{/* Contacto */}
					<div className="flex flex-col items-start">
						<h4 className="text-lg font-semibold mb-4">{t('footer.contact', { defaultValue: 'Contacto' })}</h4>
						<div className="text-gray-300 dark:text-gray-400 text-sm space-y-2 text-left transition-colors duration-200">
							<div className="flex items-center gap-2">
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
									<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
								</svg>
								<span>jyjessence@gmail.com</span>
							</div>
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
									</svg>
									<span>+506 6211-6383</span>
								</div>
								<div className="flex items-center gap-2">
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
									</svg>
									<span>+506 6044-0248</span>
								</div>
								<div className="flex items-center gap-2">
									<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
									</svg>
									<span>+506 6340-2407</span>
								</div>
							</div>
						</div>
					</div>

					{/* Redes sociales y envíos */}
					<div className="flex flex-col items-start">
						<h4 className="text-lg font-semibold mb-4">{t('footer.follow', { defaultValue: 'Síguenos' })}</h4>
						<div className="flex flex-col space-y-4 text-left">
							{/* Instagram */}
							<a 
								href="https://www.instagram.com/jyj.essence/" 
								target="_blank" 
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors duration-200"
							>
								<img 
									src="https://res.cloudinary.com/drec8g03e/image/upload/v1762661193/instagram_znvg6o.svg" 
									alt="Instagram" 
									className="w-5 h-5 object-contain"
								/>
								<span>@jyj.essence</span>
							</a>

							{/* Información de envíos */}
							<div className="text-gray-300 dark:text-gray-400 text-sm transition-colors duration-200">
								<p className="font-medium mb-1">
									{t('footer.shipping', { defaultValue: 'Envíos a todo el país' })}
								</p>
								<p className="text-xs">
									{t('footer.shipping.correos', { defaultValue: 'Por medio de Correos de Costa Rica' })}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Copyright */}
				<div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500 text-sm transition-colors duration-200">
					<p>
						{t('footer.copyright', { defaultValue: '© 2025 JyJ Essence. Todos los derechos reservados.' })}
					</p>
				</div>
			</div>
		</footer>
	);
}
