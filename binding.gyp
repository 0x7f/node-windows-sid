{
  'targets': [
    {
      'target_name': 'windows_sid',
      'product_extension': 'node',
      'type': 'loadable_module',
      'include_dirs': [
        "<!(node -e \"require('nan')\")"
      ],
            'defines': [
              '_UNICODE',
              'UNICODE',
            ],
            'configurations': {
              'Release': {
                'msvs_settings': {
                  'VCCLCompilerTool': {
                    'ExceptionHandling': 1,
                  }
                }
              }
            },
      'sources': [
        'src/binding.cpp'
      ]
    }
  ]
}
