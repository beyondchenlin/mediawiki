FROM composer:2 AS composer

FROM php:8.2-apache

# Install system deps and PHP extensions required by MediaWiki.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libicu-dev \
        libxml2-dev \
        libzip-dev \
        libpng-dev \
        libjpeg-dev \
        libfreetype6-dev \
        libonig-dev \
        libcurl4-openssl-dev \
        libssl-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        calendar \
        intl \
        mbstring \
        mysqli \
        pdo_mysql \
        xml \
        zip \
        gd \
        curl \
    && pecl install apcu redis \
    && docker-php-ext-enable apcu redis \
    && a2enmod rewrite headers deflate expires \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer /usr/bin/composer /usr/bin/composer

COPY docker/apache.conf /etc/apache2/conf-available/mediawiki.conf
RUN a2enconf mediawiki

COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini

COPY . /var/www/html

WORKDIR /var/www/html
