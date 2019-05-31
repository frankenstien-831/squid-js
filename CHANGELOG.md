History
=======

0.5.14 (May 31, 2019)
-------------------------

* `ocean.assets.create` emits the progress of the process

0.5.13 (May 31, 2019)
-------------------------

* Changed the `metadata.base.price` type to string

0.5.12 (May 29, 2019)
-------------------------

* Added the prefix of the checksum
* Stop having a cache for Web3 instance
* Improves on some contracts

0.5.11 (May 20, 2019)
-------------------------

* Improved signatures
* Allowing custom Web3 providers
* Added config of _Duero_ to execute integration tests

0.5.10 (May 15, 2019)
-------------------------

* Added _Duero_ network on Keeper network detection method
* Small refactors

0.5.9 (May 6, 2019)
-------------------------

* Simplified `ocean.assets.order` process (less Web3 provider interactions)

0.5.8 (April 30, 2019)
-------------------------

* `ocean.assets.order` emits the progress of the process
* Improved typing of DDO
* Fixed some differences between implementations on DDO generation

0.5.7 (April 23, 2019)
-------------------------

* Fixed Web3 beta 37 as peer dependency
* Fixed a difference in the download folder name when consume
* The DDOs are sent to Aquarius before confirming the DID registry transaction
* Fixed error getting Ocean instance in wrong network

0.5.6 (April 17, 2019)
-------------------------

* Added `agreement.status` method
* Added `assets.owner`, `assets.ownerAssets` and `assets.consumerAssets` methods
* Fixes on asset queries
* Fixed coverage reporting

0.5.5 (April 15, 2019)
-------------------------

* Fixed `agreements.prepare` output

0.5.4 (April 15, 2019)
-------------------------

* Improved error detection on consume

0.5.3 (April 9, 2019)
-------------------------

* Improved how is consumed the assets

0.5.2 (April 8, 2019)
-------------------------

* Support new Aquarius query response

0.5.1 (April 4, 2019)
-------------------------

* Added a way to consume files individually

0.5.0 (April 1, 2019)
-------------------------

* Integration with Keeper Contracts v0.9.0
* Using Secret Store through Brizo

0.4.1 (March 29, 2019)
-------------------------

* Refactor that allows having multiple Ocean instances with different configuration
* Fixed errors when consuming on browsers
* Fixed errors on searching assets using queries
* Update to new `files` metadata structure

0.4.0 (March 18, 2019)
-------------------------

* Integration with Keeper Contracts v0.8.6
* Complete refactor on agreements, templates and conditions
* Improved typeing

0.3.1 (February 26th, 2019)
-------------------------

* New Ocean API submodules
* Improved typeing
* Fixes on consume flow

0.3.0 (February 14th, 2019)
-------------------------

* Integration with Keeper Contracts v0.6.12
* New Ocean API submodules
* Added new fields to metadata (files, checksum)
* Added integration tests


0.0.1 (2018-)
------------------

* First release